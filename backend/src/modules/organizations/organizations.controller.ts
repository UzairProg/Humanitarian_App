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
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  VerifyOrganizationDto,
  AddMemberDto,
} from './dto/organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, PermissionKey } from '@al-husseiniya/types';

@ApiTags('Organizations')
@Controller('api/v1/organizations')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new organization' })
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orgService.create(dto, user);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List organizations' })
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.orgService.list(parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get organization details by ID' })
  async getById(@Param('id') id: string) {
    return this.orgService.getById(id);
  }

  @Post(':id/verify')
  @RequirePermissions(PermissionKey.ORGANIZATION_VERIFY)
  @ApiOperation({ summary: 'Review and update organization verification status' })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifyOrganizationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orgService.verify(id, dto, user);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List organization members (Authorized members only)' })
  async getMembers(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orgService.getMembers(id, user);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to organization (Org Admin only)' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orgService.addMember(id, dto, user);
  }
}
