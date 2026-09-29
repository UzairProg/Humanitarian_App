import {
  OrganizationModel,
  BusinessModel,
  FoodProgramModel,
  EventModel,
  VolunteerOpportunityModel,
  KnowledgeContentModel,
} from '../../models';
import {
  VerificationStatus,
  ContentPublicationStatus,
  ProgramStatus,
} from '@al-husseiniya/types';

export interface SearchResultItem {
  id: string;
  type:
    | 'ORGANIZATION'
    | 'BUSINESS'
    | 'FOOD_PROGRAM'
    | 'EVENT'
    | 'VOLUNTEER_OPPORTUNITY'
    | 'KNOWLEDGE';
  title: string;
  description: string;
  location?: string;
  category?: string;
  status?: string;
  urlPath: string;
}

export class SearchService {
  async search(
    query: string,
    typeFilter?: string,
    limitPerCategory = 5,
  ): Promise<{ results: SearchResultItem[]; total: number }> {
    if (!query || query.trim().length === 0) {
      return { results: [], total: 0 };
    }

    const regex = new RegExp(query.trim(), 'i');
    const results: SearchResultItem[] = [];

    // 1. Verified Organizations
    if (!typeFilter || typeFilter === 'all' || typeFilter === 'organizations') {
      const orgs = await OrganizationModel.find({
        verificationStatus: VerificationStatus.APPROVED,
        status: 'ACTIVE',
        $or: [{ name: regex }, { description: regex }, { location: regex }],
      })
        .limit(limitPerCategory)
        .exec();

      for (const org of orgs) {
        results.push({
          id: org.id,
          type: 'ORGANIZATION',
          title: org.name,
          description: org.description,
          location: org.location,
          urlPath: `/organizations`,
        });
      }
    }

    // 2. Verified Businesses
    if (!typeFilter || typeFilter === 'all' || typeFilter === 'businesses') {
      const bizs = await BusinessModel.find({
        verificationStatus: VerificationStatus.APPROVED,
        status: 'ACTIVE',
        $or: [
          { name: regex },
          { description: regex },
          { category: regex },
          { location: regex },
        ],
      })
        .limit(limitPerCategory)
        .exec();

      for (const b of bizs) {
        results.push({
          id: b.id,
          type: 'BUSINESS',
          title: b.name,
          description: b.description,
          category: b.category,
          location: b.location,
          urlPath: `/businesses`,
        });
      }
    }

    // 3. Active Food Programs
    if (!typeFilter || typeFilter === 'all' || typeFilter === 'food') {
      const programs = await FoodProgramModel.find({
        status: {
          $in: [
            ProgramStatus.ACTIVE,
            ProgramStatus.OPEN,
            ProgramStatus.PUBLISHED,
          ],
        },
        $or: [{ title: regex }, { description: regex }, { location: regex }],
      })
        .limit(limitPerCategory)
        .exec();

      for (const p of programs) {
        results.push({
          id: p.id,
          type: 'FOOD_PROGRAM',
          title: p.title,
          description: p.description,
          location: p.location,
          status: p.status,
          urlPath: `/food-programs`,
        });
      }
    }

    // 4. Published Events
    if (!typeFilter || typeFilter === 'all' || typeFilter === 'events') {
      const events = await EventModel.find({
        status: { $in: ['PUBLISHED', 'REGISTRATION_OPEN', 'OPEN'] },
        $or: [
          { title: regex },
          { description: regex },
          { category: regex },
          { location: regex },
        ],
      })
        .limit(limitPerCategory)
        .exec();

      for (const e of events) {
        results.push({
          id: e.id,
          type: 'EVENT',
          title: e.title,
          description: e.description,
          category: e.category,
          location: e.location,
          urlPath: `/events`,
        });
      }
    }

    // 5. Open Volunteer Opportunities
    if (!typeFilter || typeFilter === 'all' || typeFilter === 'volunteers') {
      const opps = await VolunteerOpportunityModel.find({
        status: 'OPEN',
        $or: [{ title: regex }, { description: regex }, { location: regex }],
      })
        .limit(limitPerCategory)
        .exec();

      for (const opp of opps) {
        results.push({
          id: opp.id,
          type: 'VOLUNTEER_OPPORTUNITY',
          title: opp.title,
          description: opp.description,
          category: opp.category,
          location: opp.location,
          urlPath: `/volunteers`,
        });
      }
    }

    // 6. Published Knowledge Articles
    if (!typeFilter || typeFilter === 'all' || typeFilter === 'knowledge') {
      const articles = await KnowledgeContentModel.find({
        publicationStatus: ContentPublicationStatus.PUBLISHED,
        $or: [{ title: regex }, { summary: regex }, { category: regex }],
      })
        .limit(limitPerCategory)
        .exec();

      for (const k of articles) {
        results.push({
          id: k.id,
          type: 'KNOWLEDGE',
          title: k.title,
          description: k.summary,
          category: k.category,
          urlPath: `/knowledge`,
        });
      }
    }

    return { results, total: results.length };
  }
}

export const searchService = new SearchService();
