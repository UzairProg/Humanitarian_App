import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService, UpdateProfileDto, AssignRoleDto } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, RoleType } from '@al-husseiniya/types';

@ApiTags('Users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getById(user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID (Owner or Admin)' })
  async getById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const isOwner = user.sub === id;
    const isAdmin =
      user.roles.includes(RoleType.ADMIN) ||
      user.roles.includes(RoleType.SUPER_ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Access denied: You can only view your own profile');
    }
    return this.usersService.getById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile by ID' })
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.updateProfile(id, dto, user);
  }

  @Post(':id/roles')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assign a role to user (Admins only)' })
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.usersService.assignRole(id, dto.role, user);
    return { success: true, message: `Role ${dto.role} assigned successfully` };
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all users with pagination (Admins only)' })
  async listUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.usersService.listUsers(parseInt(page, 10), parseInt(limit, 10));
  }
}
