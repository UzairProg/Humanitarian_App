import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeContent, KnowledgeContentSchema } from '../../database/schemas/knowledge-content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeContent.name, schema: KnowledgeContentSchema },
    ]),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
