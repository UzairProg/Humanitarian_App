import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from '@al-husseiniya/types';
import { VolunteerProfile, VolunteerProfileDocument } from '../../database/schemas/volunteer-profile.schema';
import { VolunteerOpportunity, VolunteerOpportunityDocument } from '../../database/schemas/volunteer-opportunity.schema';

export interface UpsertVolunteerProfileDto {
  skills: string[];
  interests: string[];
  availability: string;
  location: string;
}

export interface CreateOpportunityDto {
  organizationId: string;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  requirements: string[];
  capacity: number;
}

@Injectable()
export class VolunteersService {
  constructor(
    @InjectModel(VolunteerProfile.name)
    private profileModel: Model<VolunteerProfileDocument>,
    @InjectModel(VolunteerOpportunity.name)
    private oppModel: Model<VolunteerOpportunityDocument>,
  ) {}

  async upsertProfile(
    dto: UpsertVolunteerProfileDto,
    currentUser: JwtPayload,
  ): Promise<VolunteerProfile> {
    let profile = await this.profileModel.findOne({
      userId: currentUser.sub,
    }).exec();

    if (!profile) {
      profile = await this.profileModel.create({
        userId: currentUser.sub,
        ...dto,
        status: 'ACTIVE',
      });
    } else {
      profile.skills = dto.skills;
      profile.interests = dto.interests;
      profile.availability = dto.availability;
      profile.location = dto.location;
      await profile.save();
    }

    return profile.toJSON();
  }

  async getMyProfile(currentUser: JwtPayload): Promise<VolunteerProfile> {
    const profile = await this.profileModel.findOne({
      userId: currentUser.sub,
    }).exec();
    if (!profile) {
      throw new NotFoundException('Volunteer profile not found');
    }
    return profile.toJSON();
  }

  async createOpportunity(dto: CreateOpportunityDto): Promise<VolunteerOpportunity> {
    const opp = await this.oppModel.create({
      ...dto,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      status: 'OPEN',
    });
    return opp.toJSON();
  }

  async listOpportunities(
    page = 1,
    limit = 20,
  ): Promise<{ items: VolunteerOpportunity[]; total: number }> {
    const filter = { status: 'OPEN' };
    const [items, total] = await Promise.all([
      this.oppModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startAt: 1 })
        .exec(),
      this.oppModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }
}
