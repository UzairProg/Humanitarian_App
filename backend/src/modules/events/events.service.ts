import { EventModel, EventDocument } from '../../models/event.model';
import { auditService } from '../../services/audit.service';
import { AppError } from '../../middleware/error.middleware';

export interface CreateEventInput {
  organizationId?: string;
  title: string;
  description: string;
  location: string;
  startAt: string | Date;
  endAt: string | Date;
  category: string;
  mediaUrl?: string;
  status?: string;
}

export class EventsService {
  async create(input: CreateEventInput, organizerId: string): Promise<EventDocument> {
    if (!input.title || !input.description || !input.location || !input.startAt || !input.endAt) {
      throw new AppError('Title, description, location, startAt, and endAt are required', 400);
    }

    const event = await EventModel.create({
      ...input,
      organizerId,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      status: input.status || 'PUBLISHED',
    });

    await auditService.record({
      actorId: organizerId,
      action: 'EVENT_CREATE',
      targetType: 'EVENT',
      targetId: event.id,
      metadata: { title: event.title },
    });

    return event;
  }

  async list(
    options: {
      page?: number;
      limit?: number;
      organizationId?: string;
      search?: string;
    } = {},
  ): Promise<{ items: any[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;

    const filter: any = { status: 'PUBLISHED' };
    if (options.organizationId) {
      filter.organizationId = options.organizationId;
    }
    if (options.search) {
      filter.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      EventModel.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startAt: 1 })
        .exec(),
      EventModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(id: string): Promise<EventDocument> {
    const event = await EventModel.findById(id).exec();
    if (!event) {
      throw new AppError('Event not found', 404, 'NOT_FOUND');
    }
    return event;
  }
}

export const eventsService = new EventsService();
