import {
  EventModel,
  EventDocument,
  EventRegistrationModel,
  EventRegistrationDocument,
  UserModel,
  OrganizationMemberModel,
} from '../../models';
import { auditService } from '../../services/audit.service';
import { notificationService } from '../../services/notification.service';
import { impactService } from '../../services/impact.service';
import { AppError } from '../../middleware/error.middleware';
import { JwtPayload, RoleType, AuditAction, MetricType } from '@al-husseiniya/types';

export interface CreateEventInput {
  organizationId?: string;
  title: string;
  description: string;
  location: string;
  startAt: string | Date;
  endAt: string | Date;
  category: string;
  capacity?: number;
  format?: 'ON_SITE' | 'ONLINE' | 'HYBRID';
  accessibilityInfo?: string;
  language?: string;
  mediaUrl?: string;
  status?: string;
}

export class EventsService {
  async create(input: CreateEventInput, user: JwtPayload): Promise<EventDocument> {
    if (
      !input.title ||
      !input.description ||
      !input.location ||
      !input.startAt ||
      !input.endAt
    ) {
      throw new AppError(
        'Title, description, location, startAt, and endAt are required',
        400,
      );
    }

    const event = await EventModel.create({
      ...input,
      organizerId: user.sub,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      capacity: input.capacity || 50,
      registrationCount: 0,
      registrationRequired: true,
      format: input.format || 'ON_SITE',
      language: input.language || 'en',
      status: input.status || 'PUBLISHED',
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.CREATE,
      targetType: 'EVENT',
      targetId: event.id,
      metadata: { title: event.title, organizationId: event.organizationId },
    });

    return event;
  }

  async list(
    options: {
      page?: number;
      limit?: number;
      organizationId?: string;
      category?: string;
      status?: string;
      search?: string;
    } = {},
  ): Promise<{ items: EventDocument[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const filter: any = {};
    if (options.status) {
      filter.status = options.status;
    } else {
      filter.status = { $in: ['PUBLISHED', 'REGISTRATION_OPEN', 'FULL', 'OPEN'] };
    }

    if (options.organizationId) {
      filter.organizationId = options.organizationId;
    }
    if (options.category) {
      filter.category = options.category;
    }
    if (options.search) {
      filter.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
        { location: { $regex: options.search, $options: 'i' } },
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

    return { items, total };
  }

  async getById(id: string): Promise<EventDocument> {
    const event = await EventModel.findById(id).exec();
    if (!event) {
      throw new AppError('Event not found', 404, 'NOT_FOUND');
    }
    return event;
  }

  async update(
    id: string,
    input: Partial<CreateEventInput>,
    user: JwtPayload,
  ): Promise<EventDocument> {
    const event = await this.getById(id);

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN);

    if (!isAdmin && event.organizerId !== user.sub) {
      throw new AppError(
        'Forbidden: You are not authorized to update this event',
        403,
        'FORBIDDEN',
      );
    }

    if (input.title) event.title = input.title;
    if (input.description) event.description = input.description;
    if (input.location) event.location = input.location;
    if (input.category) event.category = input.category;
    if (input.startAt) event.startAt = new Date(input.startAt);
    if (input.endAt) event.endAt = new Date(input.endAt);
    if (input.capacity !== undefined) event.capacity = input.capacity;
    if (input.format) event.format = input.format;
    if (input.accessibilityInfo !== undefined)
      event.accessibilityInfo = input.accessibilityInfo;
    if (input.language) event.language = input.language;
    if (input.mediaUrl !== undefined) event.mediaUrl = input.mediaUrl;
    if (input.status) event.status = input.status;

    await event.save();

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.UPDATE,
      targetType: 'EVENT',
      targetId: event.id,
      metadata: { title: event.title, status: event.status },
    });

    return event;
  }

  async register(
    eventId: string,
    user: JwtPayload,
    notes?: string,
  ): Promise<EventRegistrationDocument> {
    const event = await this.getById(eventId);

    if (
      !['PUBLISHED', 'REGISTRATION_OPEN', 'OPEN'].includes(event.status)
    ) {
      throw new AppError(
        'This event is no longer accepting registrations',
        400,
        'REGISTRATION_CLOSED',
      );
    }

    // Capacity check
    if (
      event.capacity &&
      event.registrationCount !== undefined &&
      event.registrationCount >= event.capacity
    ) {
      throw new AppError(
        'This event has reached full capacity',
        400,
        'EVENT_FULL',
      );
    }

    // Duplicate check
    const existing = await EventRegistrationModel.findOne({
      eventId,
      userId: user.sub,
      status: 'CONFIRMED',
    }).exec();

    if (existing) {
      throw new AppError(
        'You are already registered for this event',
        409,
        'ALREADY_REGISTERED',
      );
    }

    const registration = await EventRegistrationModel.create({
      eventId,
      userId: user.sub,
      status: 'CONFIRMED',
      notes: notes || null,
      registeredAt: new Date(),
    });

    // Increment registration count
    event.registrationCount = (event.registrationCount || 0) + 1;
    if (event.capacity && event.registrationCount >= event.capacity) {
      event.status = 'FULL';
    }
    await event.save();

    // Confirmation notification
    await notificationService.create({
      userId: user.sub,
      type: 'event.registration.confirmed',
      title: 'Event Registration Confirmed',
      body: `You are registered for "${event.title}" on ${new Date(event.startAt).toLocaleDateString()}. Location: ${event.location}`,
      referenceType: 'EVENT',
      referenceId: event.id,
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.CREATE,
      targetType: 'EVENT_REGISTRATION',
      targetId: registration.id,
      metadata: { eventId: event.id },
    });

    return registration;
  }

  async cancelRegistration(
    eventId: string,
    user: JwtPayload,
  ): Promise<EventRegistrationDocument> {
    const registration = await EventRegistrationModel.findOne({
      eventId,
      userId: user.sub,
      status: 'CONFIRMED',
    }).exec();

    if (!registration) {
      throw new AppError(
        'No active confirmed registration found for this event',
        404,
        'NOT_FOUND',
      );
    }

    registration.status = 'CANCELLED';
    await registration.save();

    // Decrement registration count
    const event = await EventModel.findById(eventId).exec();
    if (event) {
      event.registrationCount = Math.max((event.registrationCount || 1) - 1, 0);
      if (event.status === 'FULL') {
        event.status = 'PUBLISHED';
      }
      await event.save();
    }

    // Cancellation notification
    await notificationService.create({
      userId: user.sub,
      type: 'event.registration.cancelled',
      title: 'Event Registration Cancelled',
      body: `Your registration for "${event?.title || 'the event'}" has been cancelled.`,
      referenceType: 'EVENT',
      referenceId: eventId,
    });

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.DELETE,
      targetType: 'EVENT_REGISTRATION',
      targetId: registration.id,
      metadata: { eventId },
    });

    return registration;
  }

  async listRegistrations(
    eventId: string,
    user: JwtPayload,
  ): Promise<any[]> {
    const event = await this.getById(eventId);

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN) ||
      user.roles?.includes(RoleType.MODERATOR);

    if (!isAdmin && event.organizerId !== user.sub) {
      // Check org membership
      if (event.organizationId) {
        const membership = await OrganizationMemberModel.findOne({
          organizationId: event.organizationId,
          userId: user.sub,
          status: 'ACTIVE',
        }).exec();

        if (!membership) {
          throw new AppError(
            'Forbidden: Access denied to event attendee list',
            403,
            'FORBIDDEN',
          );
        }
      } else {
        throw new AppError(
          'Forbidden: Access denied to event attendee list',
          403,
          'FORBIDDEN',
        );
      }
    }

    const registrations = await EventRegistrationModel.find({
      eventId,
      status: 'CONFIRMED',
    })
      .sort({ registeredAt: -1 })
      .exec();

    const userIds = registrations.map((r) => r.userId);
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select('firstName lastName email avatarUrl')
      .exec();
    const userMap = new Map(users.map((u) => [u.id, u]));

    return registrations.map((r) => ({
      ...r.toJSON(),
      attendee: userMap.get(r.userId)
        ? {
            id: userMap.get(r.userId)!.id,
            firstName: userMap.get(r.userId)!.firstName,
            lastName: userMap.get(r.userId)!.lastName,
            email: userMap.get(r.userId)!.email,
          }
        : null,
    }));
  }

  async getMyRegistrations(userId: string): Promise<any[]> {
    const registrations = await EventRegistrationModel.find({
      userId,
      status: 'CONFIRMED',
    })
      .sort({ registeredAt: -1 })
      .exec();

    const eventIds = registrations.map((r) => r.eventId);
    const events = await EventModel.find({ _id: { $in: eventIds } }).exec();
    const eventMap = new Map(events.map((e) => [e.id, e]));

    return registrations.map((r) => ({
      ...r.toJSON(),
      event: eventMap.get(r.eventId)?.toJSON() || null,
    }));
  }

  async updateStatus(
    id: string,
    status: string,
    user: JwtPayload,
  ): Promise<EventDocument> {
    const event = await this.getById(id);

    const isAdmin =
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN);

    if (!isAdmin && event.organizerId !== user.sub) {
      throw new AppError(
        'Forbidden: You are not authorized to change this event status',
        403,
        'FORBIDDEN',
      );
    }

    event.status = status;
    await event.save();

    // If cancelled, notify all registered attendees
    if (status === 'CANCELLED') {
      const attendees = await EventRegistrationModel.find({
        eventId: event.id,
        status: 'CONFIRMED',
      }).exec();

      for (const reg of attendees) {
        await notificationService.create({
          userId: reg.userId,
          type: 'event.cancelled',
          title: 'Event Cancelled',
          body: `Notice: The event "${event.title}" scheduled for ${new Date(event.startAt).toLocaleDateString()} has been cancelled by the organizers.`,
          referenceType: 'EVENT',
          referenceId: event.id,
        });
      }
    }

    // If completed, record impact
    if (status === 'COMPLETED') {
      await impactService.record({
        entityType: 'ORGANIZATION',
        entityId: event.organizationId || event.organizerId,
        metricType: MetricType.EVENTS_HOSTED,
        value: 1,
        source: `event:${event.id}`,
      });
    }

    await auditService.record({
      actorId: user.sub,
      action: AuditAction.STATUS_CHANGE,
      targetType: 'EVENT',
      targetId: event.id,
      metadata: { status },
    });

    return event;
  }
}

export const eventsService = new EventsService();
