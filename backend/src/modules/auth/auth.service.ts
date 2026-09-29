import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
import { UserModel, UserDocument } from '../../models/user.model';
import { OrganizationMemberModel } from '../../models/organization-member.model';
import { auditService } from '../../services/audit.service';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  locale?: string;
  timezone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(
    input: RegisterInput,
    requestId?: string,
    ipAddress?: string,
  ): Promise<AuthSession> {
    const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new AppError('An account with this email already exists', 409, 'CONFLICT');
    }

    const passwordHash = await bcrypt.hash(input.password, SECURITY_CONFIG.bcryptSaltRounds);

    const savedUser = await UserModel.create({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
      locale: input.locale || 'en',
      timezone: input.timezone || 'UTC',
      status: UserStatus.ACTIVE,
      emailVerified: false,
      phoneVerified: false,
      roles: [RoleType.INDIVIDUAL], // Prevent role escalation
    });

    const roles = [RoleType.INDIVIDUAL];
    const permissions = this.aggregatePermissions(roles);
    const tokens = this.generateTokens(savedUser.id, savedUser.email, roles, permissions);

    await auditService.record({
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
    input: LoginInput,
    requestId?: string,
    ipAddress?: string,
  ): Promise<AuthSession> {
    const user = await UserModel.findOne({ email: input.email.toLowerCase() })
      .select('+passwordHash')
      .exec();

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(
        'This account has been suspended. Please contact administration.',
        403,
        'FORBIDDEN',
      );
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const roles: RoleType[] = user.roles?.length ? user.roles : [RoleType.INDIVIDUAL];
    const permissions = this.aggregatePermissions(roles);

    const membership = await OrganizationMemberModel.findOne({ userId: user.id }).exec();
    const orgId = membership?.organizationId || null;

    const tokens = this.generateTokens(
      user.id,
      user.email,
      roles,
      permissions,
      orgId,
    );

    await auditService.record({
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

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
      const user = await UserModel.findById(payload.sub).exec();

      if (!user || user.status === UserStatus.SUSPENDED) {
        throw new AppError('User account inactive or invalid', 401, 'UNAUTHORIZED');
      }

      return this.generateTokens(
        payload.sub,
        payload.email,
        payload.roles,
        payload.permissions,
        payload.orgId,
      );
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
    }
  }

  generateTokens(
    userId: string,
    email: string,
    roles: RoleType[],
    permissions: PermissionKey[],
    orgId?: string | null,
  ): AuthTokens {
    const payload: JwtPayload = {
      sub: userId,
      email,
      roles,
      permissions,
      orgId,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: SECURITY_CONFIG.accessTokenExpiresInSeconds,
    };
  }

  async getCurrentUser(userId: string): Promise<UserDocument> {
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
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

export const authService = new AuthService();
