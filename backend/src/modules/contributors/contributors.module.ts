import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContributorsService } from './contributors.service';
import { ContributorsController } from './contributors.controller';
import { ContributorProfile, ContributorProfileSchema } from '../../database/schemas/contributor-profile.schema';
import { ContributorReviewHistory, ContributorReviewHistorySchema } from '../../database/schemas/contributor-review-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContributorProfile.name, schema: ContributorProfileSchema },
      { name: ContributorReviewHistory.name, schema: ContributorReviewHistorySchema },
    ]),
  ],
  controllers: [ContributorsController],
  providers: [ContributorsService],
  exports: [ContributorsService],
})
export class ContributorsModule {}
