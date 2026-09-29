import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../../database/schemas/event.schema';

export interface CreateEventDto {
  organizationId?: string;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  category: string;
  mediaUrl?: string;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
  ) {}

  async create(dto: CreateEventDto, organizerId: string): Promise<Event> {
    const event = await this.eventModel.create({
      ...dto,
      organizerId,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      status: 'PUBLISHED',
    });
    return event.toJSON();
  }

  async list(page = 1, limit = 20): Promise<{ items: Event[]; total: number }> {
    const [items, total] = await Promise.all([
      this.eventModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startAt: 1 })
        .exec(),
      this.eventModel.countDocuments().exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event.toJSON();
  }
}
