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
import { EventsService, CreateEventDto } from './events.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, PermissionKey } from '@al-husseiniya/types';

@ApiTags('Events')
@Controller('api/v1/events')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @RequirePermissions(PermissionKey.EVENT_CREATE)
  @ApiOperation({ summary: 'Create a community event' })
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventsService.create(dto, user.sub);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published community events' })
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.eventsService.list(parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get event details by ID' })
  async getById(@Param('id') id: string) {
    return this.eventsService.getById(id);
  }
}
