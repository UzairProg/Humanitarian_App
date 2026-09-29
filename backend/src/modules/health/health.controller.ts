import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health & Monitoring')
@Controller('api')
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Liveness probe endpoint' })
  getLiveness() {
    return {
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe verifying MongoDB database connectivity' })
  async getReadiness(@Res() res: Response) {
    try {
      const isDbConnected = this.connection.readyState === 1; // 1 = connected
      if (!isDbConnected) {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: 'DOWN',
          database: 'DISCONNECTED',
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(HttpStatus.OK).json({
        status: 'READY',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
      });
    } catch {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'DOWN',
        database: 'ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
