import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from '@al-husseiniya/types';

@ApiTags('Humanitarian Requests')
@Controller('api/v1/requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List active humanitarian assistance categories' })
  async listCategories() {
    return this.requestsService.listCategories();
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new humanitarian request' })
  async create(
    @Body() dto: CreateRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.requestsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List requests (filtered by user ownership or staff access)' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.requestsService.list(
      user,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get humanitarian request by ID with object-level authorization' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.requestsService.getById(id, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update humanitarian request status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.requestsService.updateStatus(id, dto, user);
  }
}
