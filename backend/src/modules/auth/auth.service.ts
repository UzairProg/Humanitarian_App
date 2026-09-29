import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import {
  RoleType,
  UserStatus,
  PermissionKey,
  AuthSession,
  AuthTokens,
  JwtPayload,
  AuditAction,
} from '@al-husseiniya/types';
import { ROLE_PERMISSIONS_MAP, SECURITY_CONFIG } from '@al-husseiniya/config';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Role, RoleDocument } from '../../database/schemas/role.schema';
import { OrganizationMember, OrganizationMemberDocument } from '../../database/schemas/organization-member.schema';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { AuditService } from '../../infrastructure/audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    @InjectModel(OrganizationMember.name)
    private orgMemberModel: Model<OrganizationMemberDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async register(
    dto: RegisterDto,
    requestId?: string,
    ipAddress?: string,
  ): Promise<AuthSession> {
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      SECURITY_CONFIG.bcryptSaltRounds,
    );

    const savedUser = await this.userModel.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone || null,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      phoneVerified: false,
      roles: [RoleType.INDIVIDUAL], // Prevent role escalation
    });

    const roles = [RoleType.INDIVIDUAL];
    const permissions = this.aggregatePermissions(roles);
    const tokens = await this.generateTokens(savedUser.id, savedUser.email, roles, permissions);

    await this.auditService.record({
      actorId: savedUser.id,
      action: AuditAction.CREATE,
      targetType: 'USER',
      targetId: savedUser.id,
      metadata: { email: savedUser.email },
      requestId,
      ipAddress,
    });

    return {
      user: savedUser.toJSON(),
      roles,
      permissions,
      tokens,
    };
  }

  async login(
    dto: LoginDto,
    requestId?: string,
    ipAddress?: string,
  ): Promise<AuthSession> {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+passwordHash')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('This account has been suspended. Please contact administration');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles: RoleType[] = user.roles?.length ? user.roles : [RoleType.INDIVIDUAL];
    const permissions = this.aggregatePermissions(roles);

    const membership = await this.orgMemberModel.findOne({ userId: user.id }).exec();
    const orgId = membership?.organizationId || null;

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      roles,
      permissions,
      orgId,
    );

    await this.auditService.record({
      actorId: user.id,
      action: AuditAction.LOGIN,
      targetType: 'USER',
      targetId: user.id,
      metadata: { email: user.email },
      requestId,
      ipAddress,
    });

    return {
      user: user.toJSON(),
      roles,
      permissions,
      tokens,
    };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<AuthTokens> {
    try {
      const refreshSecret = this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'al_husseiniya_dev_jwt_refresh_secret_change_in_production_min32chars',
      );
      const payload: JwtPayload = this.jwtService.verify(dto.refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.userModel.findById(payload.sub).exec();
      if (!user || user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('User account inactive or invalid');
      }

      return this.generateTokens(
        payload.sub,
        payload.email,
        payload.roles,
        payload.permissions,
        payload.orgId,
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async generateTokens(
    userId: string,
    email: string,
    roles: RoleType[],
    permissions: PermissionKey[],
    orgId?: string | null,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      roles,
      permissions,
      orgId,
    };

    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'al_husseiniya_dev_jwt_access_secret_change_in_production_min32chars',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'al_husseiniya_dev_jwt_refresh_secret_change_in_production_min32chars',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: SECURITY_CONFIG.accessTokenExpiresInSeconds,
    };
  }

  private aggregatePermissions(roles: RoleType[]): PermissionKey[] {
    const set = new Set<PermissionKey>();
    roles.forEach((r) => {
      const perms = ROLE_PERMISSIONS_MAP[r] || [];
      perms.forEach((p) => set.add(p));
    });
    return Array.from(set);
  }
}
