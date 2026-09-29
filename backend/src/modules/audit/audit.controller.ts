import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from '../../infrastructure/audit/audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionKey } from '@al-husseiniya/types';

@ApiTags('Audit & Compliance')
@Controller('api/v1/audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(PermissionKey.AUDIT_VIEW)
  @ApiOperation({ summary: 'Retrieve system audit logs (Authorized Auditors & Admins only)' })
  async getLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const [items, total] = await this.auditService.getRecentLogs(limitNum, offset);
    return { items, total };
  }
}
