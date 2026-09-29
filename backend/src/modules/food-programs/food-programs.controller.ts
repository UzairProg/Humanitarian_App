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
import { FoodProgramsService, CreateFoodProgramDto } from './food-programs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, PermissionKey } from '@al-husseiniya/types';

@ApiTags('Food Programs')
@Controller('api/v1/food-programs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FoodProgramsController {
  constructor(private readonly foodService: FoodProgramsService) {}

  @Post()
  @RequirePermissions(PermissionKey.FOOD_CREATE)
  @ApiOperation({ summary: 'Create a new food distribution program (Org staff only)' })
  async create(@Body() dto: CreateFoodProgramDto) {
    return this.foodService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List scheduled and active food programs' })
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.foodService.list(parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get food program details by ID' })
  async getById(@Param('id') id: string) {
    return this.foodService.getById(id);
  }

  @Post(':id/reserve')
  @ApiOperation({ summary: 'Reserve meal distribution kit for self/family' })
  async reserve(
    @Param('id') id: string,
    @Body('count') count = 1,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.foodService.reserve(id, count, user);
  }
}
