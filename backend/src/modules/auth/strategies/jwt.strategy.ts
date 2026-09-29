import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@al-husseiniya/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ACCESS_SECRET',
        'al_husseiniya_dev_jwt_access_secret_change_in_production_min32chars',
      ),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    return payload;
  }
}
