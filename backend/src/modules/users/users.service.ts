import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleType, JwtPayload } from '@al-husseiniya/types';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Role, RoleDocument } from '../../database/schemas/role.schema';
import { AuthorizationService } from '../../common/authorization/authorization.service';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  locale?: string;
  timezone?: string;
  phone?: string;
  roles?: any;
  status?: any;
}

export interface AssignRoleDto {
  role: RoleType;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    private authzService: AuthorizationService,
  ) {}

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.toJSON();
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    currentUser: JwtPayload,
  ): Promise<User> {
    if (userId !== currentUser.sub && !this.isAdmin(currentUser)) {
      throw new ForbiddenException('Access denied: You cannot edit another user profile');
    }

    if (dto.roles !== undefined || dto.status !== undefined) {
      throw new ForbiddenException('Forbidden: Roles and account status cannot be updated via profile endpoints');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.locale) user.locale = dto.locale;
    if (dto.timezone) user.timezone = dto.timezone;
    if (dto.phone !== undefined) user.phone = dto.phone;

    const saved = await user.save();
    return saved.toJSON();
  }

  async assignRole(
    targetUserId: string,
    roleType: RoleType,
    actor: JwtPayload,
  ): Promise<void> {
    this.authzService.assertCanAssignRoles(actor);

    if (roleType === RoleType.SUPER_ADMIN && !actor.roles.includes(RoleType.SUPER_ADMIN)) {
      throw new ForbiddenException('Only Super Administrators can assign the SUPER_ADMIN role');
    }

    const targetUser = await this.userModel.findById(targetUserId).exec();
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    if (!targetUser.roles.includes(roleType)) {
      targetUser.roles.push(roleType);
      await targetUser.save();
    }
  }

  async listUsers(page = 1, limit = 20): Promise<{ items: User[]; total: number }> {
    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      items: users.map((u) => u.toJSON()),
      total,
    };
  }

  private isAdmin(user: JwtPayload): boolean {
    return (
      user.roles?.includes(RoleType.ADMIN) ||
      user.roles?.includes(RoleType.SUPER_ADMIN)
    );
  }
}
