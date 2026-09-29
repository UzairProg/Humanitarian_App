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
  ContributorsService,
  ApplyContributorDto,
  ReviewContributorDto,
} from './contributors.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, PermissionKey } from '@al-husseiniya/types';

@ApiTags('Contributors')
@Controller('api/v1/contributors')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ContributorsController {
  constructor(private readonly contribService: ContributorsService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Apply for contributor or specialist profile' })
  async apply(
    @Body() dto: ApplyContributorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contribService.apply(dto, user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user contributor profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.contribService.getMyProfile(user);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List approved and visible contributors' })
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.contribService.list(parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get contributor profile details' })
  async getById(@Param('id') id: string) {
    return this.contribService.getById(id);
  }

  @Post(':id/review')
  @RequirePermissions(PermissionKey.CONTRIBUTOR_REVIEW)
  @ApiOperation({ summary: 'Review contributor application status (Reviewers & Admins only)' })
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewContributorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contribService.review(id, dto, user);
  }
}
