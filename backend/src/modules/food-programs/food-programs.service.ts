import {
  ProgramStatus,
  JwtPayload,
  MetricType,
  RoleType,
} from '@al-husseiniya/types';
import { FoodProgramModel, FoodProgramDocument } from '../../models/food-program.model';
import { FoodProgramAvailabilityModel } from '../../models/food-program-availability.model';
import { OrganizationModel } from '../../models/organization.model';
import { OrganizationMemberModel } from '../../models/organization-member.model';
import { impactService } from '../../services/impact.service';
import { notificationService } from '../../services/notification.service';
import { auditService } from '../../services/audit.service';
import { authorizationService } from '../../services/authorization.service';
import { AppError } from '../../middleware/error.middleware';

export interface CreateFoodProgramInput {
  organizationId: string;
  title: string;
  description: string;
  location: string;
  programDate: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  instructions?: string;
  status?: ProgramStatus;
}

export interface ListFoodProgramsOptions {
  page?: number;
  limit?: number;
  organizationId?: string;
  programDate?: string;
  location?: string;
  search?: string;
  includeAllStatuses?: boolean;
}

export class FoodProgramsService {
  async create(
    input: CreateFoodProgramInput,
    currentUser: JwtPayload,
  ): Promise<FoodProgramDocument> {
    const org = await OrganizationModel.findById(input.organizationId).exec();
    if (!org) {
      throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');
    }

    const isAdmin = authorizationService.isSuperAdminOrAdmin(currentUser);
    const membership = await OrganizationMemberModel.findOne({
      organizationId: input.organizationId,
      userId: currentUser.sub,
    }).exec();

    if (!isAdmin && !membership) {
      throw new AppError(
        'Access denied: You are not authorized to create programs for this organization',
        403,
        'FORBIDDEN',
      );
    }

    const capacity = input.capacity !== undefined ? Math.max(0, input.capacity) : 100;
    const status = input.status || ProgramStatus.ACTIVE;

    const program = await FoodProgramModel.create({
      organizationId: input.organizationId,
      title: input.title.trim(),
      description: input.description.trim(),
      location: input.location.trim(),
      programDate: input.programDate,
      startTime: input.startTime,
      endTime: input.endTime,
      capacity,
      remainingCapacity: capacity,
      status,
      instructions: input.instructions || null,
    });

    await auditService.record({
      actorId: currentUser.sub,
      action: 'FOOD_PROGRAM_CREATE',
      targetType: 'FOOD_PROGRAM',
      targetId: program.id,
      metadata: { title: program.title, capacity },
    });

    return program;
  }

  async list(
    options: ListFoodProgramsOptions = {},
    currentUser?: JwtPayload,
  ): Promise<{ items: any[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;

    const filter: any = {};

    const isPrivileged =
      currentUser &&
      (authorizationService.isSuperAdminOrAdmin(currentUser) ||
        options.includeAllStatuses);

    if (!isPrivileged) {
      // General discovery: Only show active, open, published, or limited programs
      filter.status = {
        $in: [
          ProgramStatus.ACTIVE,
          ProgramStatus.OPEN,
          ProgramStatus.PUBLISHED,
          ProgramStatus.LIMITED,
        ],
      };
    }

    if (options.organizationId) {
      filter.organizationId = options.organizationId;
    }
    if (options.programDate) {
      filter.programDate = options.programDate;
    }
    if (options.location) {
      filter.location = { $regex: options.location, $options: 'i' };
    }
    if (options.search) {
      filter.title = { $regex: options.search, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      FoodProgramModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ programDate: 1, startTime: 1 })
        .exec(),
      FoodProgramModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(id: string): Promise<FoodProgramDocument> {
    const program = await FoodProgramModel.findById(id).exec();
    if (!program) {
      throw new AppError('Food program not found', 404, 'NOT_FOUND');
    }
    return program;
  }

  async update(
    id: string,
    updates: Partial<CreateFoodProgramInput>,
    currentUser: JwtPayload,
  ): Promise<FoodProgramDocument> {
    const program = await FoodProgramModel.findById(id).exec();
    if (!program) {
      throw new AppError('Food program not found', 404, 'NOT_FOUND');
    }

    const isAdmin = authorizationService.isSuperAdminOrAdmin(currentUser);
    const membership = await OrganizationMemberModel.findOne({
      organizationId: program.organizationId,
      userId: currentUser.sub,
    }).exec();

    if (!isAdmin && !membership) {
      throw new AppError(
        'Access denied: You are not authorized to update this food program',
        403,
        'FORBIDDEN',
      );
    }

    if (updates.title) program.title = updates.title.trim();
    if (updates.description) program.description = updates.description.trim();
    if (updates.location) program.location = updates.location.trim();
    if (updates.programDate) program.programDate = updates.programDate;
    if (updates.startTime) program.startTime = updates.startTime;
    if (updates.endTime) program.endTime = updates.endTime;
    if (updates.instructions !== undefined) program.instructions = updates.instructions;
    if (updates.status) program.status = updates.status;

    if (updates.capacity !== undefined) {
      const diff = updates.capacity - program.capacity;
      program.capacity = updates.capacity;
      program.remainingCapacity = Math.max(0, program.remainingCapacity + diff);
    }

    const saved = await program.save();
    return saved;
  }

  /**
   * Safe atomic meal reservation / claim preventing overbooking race conditions
   */
  async reserve(
    id: string,
    count = 1,
    currentUser: JwtPayload,
  ): Promise<FoodProgramDocument> {
    if (count <= 0) {
      throw new AppError('Reservation count must be at least 1', 400);
    }

    // Atomic update: only succeeds if remainingCapacity >= count
    const program = await FoodProgramModel.findOneAndUpdate(
      {
        _id: id,
        remainingCapacity: { $gte: count },
      },
      {
        $inc: { remainingCapacity: -count },
      },
      { new: true },
    ).exec();

    if (!program) {
      throw new AppError(
        'Not enough remaining meal capacity available for this program',
        400,
        'INSUFFICIENT_CAPACITY',
      );
    }

    // If remaining capacity hits zero, mark status as FULL or LIMITED
    if (program.remainingCapacity === 0) {
      program.status = ProgramStatus.FULL;
      await program.save();
    } else if (program.remainingCapacity <= 10) {
      program.status = ProgramStatus.LIMITED;
      await program.save();
    }

    // Record persistent reservation record
    await FoodProgramAvailabilityModel.create({
      programId: program.id,
      userId: currentUser.sub,
      count,
      status: 'RESERVED',
      timestamp: new Date(),
    });

    // Record traceable impact metric
    await impactService.record({
      entityType: 'ORGANIZATION',
      entityId: program.organizationId,
      metricType: MetricType.MEALS_DISTRIBUTED,
      value: count,
      source: 'FOOD_PROGRAM_RESERVATION',
    });

    // Send confirmation notification
    await notificationService.create({
      userId: currentUser.sub,
      type: 'MEAL_RESERVED',
      title: 'Meals Reserved Successfully',
      body: `You have successfully reserved ${count} meal(s) for "${program.title}" on ${program.programDate}.`,
      referenceType: 'FOOD_PROGRAM',
      referenceId: program.id,
    });

    return program;
  }
}

export const foodProgramsService = new FoodProgramsService();
