import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExtendedRequest } from '../../common/middleware/request-id.middleware';
import { JwtPayload } from '@al-husseiniya/types';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new individual user account' })
  async register(@Body() dto: RegisterDto, @Req() req: ExtendedRequest) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    return this.authService.register(dto, req.requestId, ip);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and return JWT tokens' })
  async login(@Body() dto: LoginDto, @Req() req: ExtendedRequest) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    return this.authService.login(dto, req.requestId, ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh expired access token with valid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(@CurrentUser() user: JwtPayload) {
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get currently authenticated user identity and permissions' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
