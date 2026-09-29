import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  VolunteersService,
  UpsertVolunteerProfileDto,
  CreateOpportunityDto,
} from './volunteers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from '@al-husseiniya/types';

@ApiTags('Volunteers')
@Controller('api/v1/volunteers')
@UseGuards(JwtAuthGuard)
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Create or update volunteer service profile' })
  async upsertProfile(
    @Body() dto: UpsertVolunteerProfileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.volunteersService.upsertProfile(dto, user);
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user volunteer profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.volunteersService.getMyProfile(user);
  }

  @Post('opportunities')
  @ApiOperation({ summary: 'Create a volunteer opportunity for an organization' })
  async createOpportunity(@Body() dto: CreateOpportunityDto) {
    return this.volunteersService.createOpportunity(dto);
  }

  @Public()
  @Get('opportunities')
  @ApiOperation({ summary: 'List open volunteer opportunities' })
  async listOpportunities(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.volunteersService.listOpportunities(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }
}
