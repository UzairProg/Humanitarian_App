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
import { BusinessesService, CreateBusinessDto, VerifyBusinessDto } from './businesses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, PermissionKey } from '@al-husseiniya/types';

@ApiTags('Businesses')
@Controller('api/v1/businesses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BusinessesController {
  constructor(private readonly businessService: BusinessesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a business entity' })
  async create(
    @Body() dto: CreateBusinessDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.businessService.create(dto, user);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List businesses' })
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.businessService.list(parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get business details by ID' })
  async getById(@Param('id') id: string) {
    return this.businessService.getById(id);
  }

  @Post(':id/verify')
  @RequirePermissions(PermissionKey.BUSINESS_VERIFY)
  @ApiOperation({ summary: 'Review and update business verification status (Reviewers only)' })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifyBusinessDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.businessService.verify(id, dto, user);
  }
}
