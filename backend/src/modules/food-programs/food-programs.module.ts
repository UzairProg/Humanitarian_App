import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodProgramsService } from './food-programs.service';
import { FoodProgramsController } from './food-programs.controller';
import { FoodProgram, FoodProgramSchema } from '../../database/schemas/food-program.schema';
import { FoodProgramAvailability, FoodProgramAvailabilitySchema } from '../../database/schemas/food-program-availability.schema';
import { ImpactRecord, ImpactRecordSchema } from '../../database/schemas/impact-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FoodProgram.name, schema: FoodProgramSchema },
      { name: FoodProgramAvailability.name, schema: FoodProgramAvailabilitySchema },
      { name: ImpactRecord.name, schema: ImpactRecordSchema },
    ]),
  ],
  controllers: [FoodProgramsController],
  providers: [FoodProgramsService],
  exports: [FoodProgramsService],
})
export class FoodProgramsModule {}
