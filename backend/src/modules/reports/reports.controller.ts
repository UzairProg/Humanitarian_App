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
import {
  ReportsService,
  SubmitReportDto,
  ResolveReportDto,
} from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, PermissionKey } from '@al-husseiniya/types';

@ApiTags('Reports & Moderation')
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a moderation report against content, user or entity' })
  async submit(
    @Body() dto: SubmitReportDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reportsService.submitReport(dto, user);
  }

  @Get()
  @RequirePermissions(PermissionKey.REPORT_VIEW)
  @ApiOperation({ summary: 'List submitted reports (Moderators & Admins only)' })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.reportsService.list(parseInt(page, 10), parseInt(limit, 10));
  }

  @Post(':id/resolve')
  @RequirePermissions(PermissionKey.REPORT_RESOLVE)
  @ApiOperation({ summary: 'Resolve a moderation report with resolution details' })
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reportsService.resolveReport(id, dto, user);
  }
}
