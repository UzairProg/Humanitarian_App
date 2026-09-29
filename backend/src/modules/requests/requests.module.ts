import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { HumanitarianRequest, HumanitarianRequestSchema } from '../../database/schemas/humanitarian-request.schema';
import { RequestCategory, RequestCategorySchema } from '../../database/schemas/request-category.schema';
import { RequestStatusHistory, RequestStatusHistorySchema } from '../../database/schemas/request-status-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HumanitarianRequest.name, schema: HumanitarianRequestSchema },
      { name: RequestCategory.name, schema: RequestCategorySchema },
      { name: RequestStatusHistory.name, schema: RequestStatusHistorySchema },
    ]),
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
