import { MetricType } from '@al-husseiniya/types';
import { ImpactRecordModel, ImpactRecordDocument } from '../models/impact-record.model';
import { HumanitarianRequestModel } from '../models/humanitarian-request.model';
import { FoodProgramModel } from '../models/food-program.model';
import { OrganizationModel } from '../models/organization.model';
import { EventModel } from '../models/event.model';
import { VolunteerProfileModel, VolunteerOpportunityModel } from '../models/volunteer.model';
import { RequestStatus, ProgramStatus } from '@al-husseiniya/types';

export interface RecordImpactOptions {
  entityType: string;
  entityId: string;
  metricType: MetricType;
  value: number;
  source: string;
}

export class ImpactService {
  async record(opts: RecordImpactOptions): Promise<ImpactRecordDocument> {
    return ImpactRecordModel.create({
      entityType: opts.entityType,
      entityId: opts.entityId,
      metricType: opts.metricType,
      value: opts.value,
      source: opts.source,
      timestamp: new Date(),
    });
  }

  /**
   * Calculates platform-wide summary based on real recorded database records.
   */
  async getPlatformSummary(): Promise<{
    mealsDistributed: number;
    requestsFulfilled: number;
    activePrograms: number;
    verifiedOrganizations: number;
    eventsConducted: number;
    activeVolunteersCount: number;
    upcomingEventsCount: number;
    totalMealsDistributed: number;
    totalRequestsFulfilled: number;
    activeProgramsCount: number;
    verifiedOrganizationsCount: number;
  }> {
    // 1. Aggregated meals from impact records
    const mealAgg = await ImpactRecordModel.aggregate([
      { $match: { metricType: MetricType.MEALS_DISTRIBUTED } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    const mealsDistributed = mealAgg.length > 0 ? mealAgg[0].total : 0;

    // 2. Completed requests
    const requestsFulfilled = await HumanitarianRequestModel.countDocuments({
      status: { $in: [RequestStatus.COMPLETED, RequestStatus.FULFILLED] },
    });

    // 3. Active programs
    const activePrograms = await FoodProgramModel.countDocuments({
      status: { $in: [ProgramStatus.ACTIVE, ProgramStatus.OPEN, ProgramStatus.PUBLISHED] },
    });

    // 4. Verified organizations
    const verifiedOrganizations = await OrganizationModel.countDocuments({
      verificationStatus: 'APPROVED',
    });

    // 5. Events conducted / scheduled
    const eventsConducted = await EventModel.countDocuments({
      status: { $in: ['PUBLISHED', 'REGISTRATION_OPEN', 'OPEN', 'COMPLETED'] },
    });

    // 6. Active volunteer count
    const activeVolunteersCount = await VolunteerProfileModel.countDocuments({
      status: 'ACTIVE',
    });

    return {
      mealsDistributed,
      requestsFulfilled,
      activePrograms,
      verifiedOrganizations,
      eventsConducted,
      activeVolunteersCount,
      upcomingEventsCount: eventsConducted,
      totalMealsDistributed: mealsDistributed,
      totalRequestsFulfilled: requestsFulfilled,
      activeProgramsCount: activePrograms,
      verifiedOrganizationsCount: verifiedOrganizations,
    };
  }

  /**
   * Calculates organization-specific impact from real data.
   */
  async getOrganizationImpact(organizationId: string): Promise<{
    mealsDistributed: number;
    requestsFulfilled: number;
    activePrograms: number;
    eventsHosted: number;
    volunteerOpportunities: number;
  }> {
    const mealAgg = await ImpactRecordModel.aggregate([
      {
        $match: {
          entityType: 'ORGANIZATION',
          entityId: organizationId,
          metricType: MetricType.MEALS_DISTRIBUTED,
        },
      },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    const mealsDistributed = mealAgg.length > 0 ? mealAgg[0].total : 0;

    const requestsFulfilled = await HumanitarianRequestModel.countDocuments({
      organizationId,
      status: { $in: [RequestStatus.COMPLETED, RequestStatus.FULFILLED] },
    });

    const activePrograms = await FoodProgramModel.countDocuments({
      organizationId,
      status: { $in: [ProgramStatus.ACTIVE, ProgramStatus.OPEN, ProgramStatus.PUBLISHED] },
    });

    const eventsHosted = await EventModel.countDocuments({
      organizationId,
      status: { $in: ['PUBLISHED', 'COMPLETED'] },
    });

    const volunteerOpportunities = await VolunteerOpportunityModel.countDocuments({
      organizationId,
    });

    return {
      mealsDistributed,
      requestsFulfilled,
      activePrograms,
      eventsHosted,
      volunteerOpportunities,
    };
  }
}

export const impactService = new ImpactService();
