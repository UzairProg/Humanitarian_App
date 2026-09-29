import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../database/schemas/role.schema';
import { Permission, PermissionDocument } from '../../database/schemas/permission.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@al-husseiniya/types';

@ApiTags('Roles & Permissions')
@Controller('api/v1/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name)
    private permModel: Model<PermissionDocument>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all defined system roles' })
  async listRoles() {
    return this.roleModel.find().exec();
  }

  @Get('permissions')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all system permissions (Admins only)' })
  async listPermissions() {
    return this.permModel.find().exec();
  }
}
