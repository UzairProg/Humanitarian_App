import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KnowledgeService, CreateKnowledgeDto } from './knowledge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, PermissionKey } from '@al-husseiniya/types';

@ApiTags('Knowledge & Content')
@Controller('api/v1/knowledge')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @RequirePermissions(PermissionKey.CONTENT_CREATE)
  @ApiOperation({ summary: 'Draft a new educational article/content piece' })
  async create(
    @Body() dto: CreateKnowledgeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.knowledgeService.create(dto, user);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published educational and cultural content' })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('lang') lang = 'en',
  ) {
    return this.knowledgeService.listPublished(
      parseInt(page, 10),
      parseInt(limit, 10),
      lang,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get published knowledge article details by ID' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.knowledgeService.getById(id, user);
  }

  @Post(':id/publish')
  @RequirePermissions(PermissionKey.CONTENT_PUBLISH)
  @ApiOperation({ summary: 'Publish reviewed content (Moderators & Admins only)' })
  async publish(@Param('id') id: string) {
    return this.knowledgeService.publish(id);
  }
}
