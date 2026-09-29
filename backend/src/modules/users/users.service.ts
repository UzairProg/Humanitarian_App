import { RoleType, JwtPayload } from '@al-husseiniya/types';
import { UserModel, UserDocument } from '../../models/user.model';
import { authorizationService } from '../../services/authorization.service';
import { AppError } from '../../middleware/error.middleware';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  locale?: string;
  timezone?: string;
  phone?: string;
  roles?: any;
  status?: any;
}

export class UsersService {
  async getById(id: string): Promise<UserDocument> {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
    currentUser: JwtPayload,
  ): Promise<UserDocument> {
    const isAdmin = authorizationService.isSuperAdminOrAdmin(currentUser);
    if (userId !== currentUser.sub && !isAdmin) {
      throw new AppError(
        'Access denied: You cannot edit another user profile',
        403,
        'FORBIDDEN',
      );
    }

    if (input.roles !== undefined || input.status !== undefined) {
      throw new AppError(
        'Forbidden: Roles and account status cannot be updated via profile endpoints',
        403,
        'FORBIDDEN',
      );
    }

    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    if (input.firstName) user.firstName = input.firstName.trim();
    if (input.lastName) user.lastName = input.lastName.trim();
    if (input.locale) user.locale = input.locale;
    if (input.timezone) user.timezone = input.timezone;
    if (input.phone !== undefined) user.phone = input.phone;

    const saved = await user.save();
    return saved;
  }

  async assignRole(
    targetUserId: string,
    roleType: RoleType,
    actor: JwtPayload,
  ): Promise<UserDocument> {
    authorizationService.assertCanAssignRoles(actor);

    if (roleType === RoleType.SUPER_ADMIN && !actor.roles.includes(RoleType.SUPER_ADMIN)) {
      throw new AppError(
        'Only Super Administrators can assign the SUPER_ADMIN role',
        403,
        'FORBIDDEN',
      );
    }

    const targetUser = await UserModel.findById(targetUserId).exec();
    if (!targetUser) {
      throw new AppError('Target user not found', 404, 'NOT_FOUND');
    }

    if (!targetUser.roles.includes(roleType)) {
      targetUser.roles.push(roleType);
      await targetUser.save();
    }

    return targetUser;
  }

  async listUsers(page = 1, limit = 20): Promise<{ items: any[]; total: number }> {
    const [users, total] = await Promise.all([
      UserModel.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      UserModel.countDocuments().exec(),
    ]);

    return {
      items: users.map((u) => u.toJSON()),
      total,
    };
  }
}

export const usersService = new UsersService();
