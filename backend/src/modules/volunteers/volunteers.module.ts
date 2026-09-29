import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';
import { VolunteerProfile, VolunteerProfileSchema } from '../../database/schemas/volunteer-profile.schema';
import { VolunteerOpportunity, VolunteerOpportunitySchema } from '../../database/schemas/volunteer-opportunity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VolunteerProfile.name, schema: VolunteerProfileSchema },
      { name: VolunteerOpportunity.name, schema: VolunteerOpportunitySchema },
    ]),
  ],
  controllers: [VolunteersController],
  providers: [VolunteersService],
  exports: [VolunteersService],
})
export class VolunteersModule {}
