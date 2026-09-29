import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { Business, BusinessSchema } from '../../database/schemas/business.schema';
import { BusinessVerification, BusinessVerificationSchema } from '../../database/schemas/business-verification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: BusinessVerification.name, schema: BusinessVerificationSchema },
    ]),
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
