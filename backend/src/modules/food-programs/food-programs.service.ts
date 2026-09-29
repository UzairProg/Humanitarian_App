import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProgramStatus, JwtPayload, MetricType } from '@al-husseiniya/types';
import { FoodProgram, FoodProgramDocument } from '../../database/schemas/food-program.schema';
import { ImpactRecord, ImpactRecordDocument } from '../../database/schemas/impact-record.schema';

export interface CreateFoodProgramDto {
  organizationId: string;
  title: string;
  description: string;
  location: string;
  programDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  instructions?: string;
}

@Injectable()
export class FoodProgramsService {
  constructor(
    @InjectModel(FoodProgram.name)
    private foodModel: Model<FoodProgramDocument>,
    @InjectModel(ImpactRecord.name)
    private impactModel: Model<ImpactRecordDocument>,
  ) {}

  async create(dto: CreateFoodProgramDto): Promise<FoodProgram> {
    const program = await this.foodModel.create({
      ...dto,
      remainingCapacity: dto.capacity,
      status: ProgramStatus.ACTIVE,
    });
    return program.toJSON();
  }

  async list(page = 1, limit = 20): Promise<{ items: FoodProgram[]; total: number }> {
    const [items, total] = await Promise.all([
      this.foodModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ programDate: 1 })
        .exec(),
      this.foodModel.countDocuments().exec(),
    ]);

    return {
      items: items.map((i) => i.toJSON()),
      total,
    };
  }

  async getById(id: string): Promise<FoodProgram> {
    const prog = await this.foodModel.findById(id).exec();
    if (!prog) {
      throw new NotFoundException('Food program not found');
    }
    return prog.toJSON();
  }

  async reserve(id: string, count = 1, currentUser: JwtPayload): Promise<FoodProgram> {
    const prog = await this.foodModel.findById(id).exec();
    if (!prog) {
      throw new NotFoundException('Food program not found');
    }

    if (prog.remainingCapacity < count) {
      throw new BadRequestException('Not enough remaining meal capacity for this program');
    }

    prog.remainingCapacity -= count;
    const updated = await prog.save();

    await this.impactModel.create({
      entityType: 'FOOD_PROGRAM',
      entityId: prog.id,
      metricType: MetricType.MEALS_DISTRIBUTED,
      value: count,
      source: 'USER_RESERVATION',
      timestamp: new Date(),
    });

    return updated.toJSON();
  }
}
