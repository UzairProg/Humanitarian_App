import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtPayload, RoleType, PermissionKey } from '@al-husseiniya/types';
import { HumanitarianRequest } from '../../database/schemas/humanitarian-request.schema';

@Injectable()
export class AuthorizationService {
  /**
   * Object-level authorization for Humanitarian Requests:
   * Private requests can only be accessed by the owner or staff/admins with review permissions.
   */
  canAccessRequest(user: JwtPayload, request: HumanitarianRequest): boolean {
    if (this.isSuperAdminOrAdmin(user)) {
      return true;
    }
    if (user.roles?.includes(RoleType.MODERATOR)) {
      return true;
    }
    if (request.requesterId === user.sub) {
      return true;
    }
    // If request is public, allow read
    if (!request.isPrivate) {
      return true;
    }
    return false;
  }

  assertCanAccessRequest(user: JwtPayload, request: HumanitarianRequest): void {
    if (!this.canAccessRequest(user, request)) {
      throw new ForbiddenException('Access denied: You do not own this private humanitarian request');
    }
  }

  /**
   * Object-level authorization for Organization Private Data:
   * Users can only access private data of organizations they belong to.
   */
  canAccessOrganization(
    user: JwtPayload,
    organizationId: string,
    userOrganizationIds: string[],
  ): boolean {
    if (this.isSuperAdminOrAdmin(user)) {
      return true;
    }
    return userOrganizationIds.includes(organizationId);
  }

  assertCanAccessOrganization(
    user: JwtPayload,
    organizationId: string,
    userOrganizationIds: string[],
  ): void {
    if (!this.canAccessOrganization(user, organizationId, userOrganizationIds)) {
      throw new ForbiddenException(
        'Access denied: You do not have membership privileges for this organization',
      );
    }
  }

  /**
   * Prevents privilege escalation:
   * Non-admins cannot assign, modify, or escalate roles.
   */
  assertCanAssignRoles(actor: JwtPayload): void {
    if (!this.isSuperAdminOrAdmin(actor)) {
      throw new ForbiddenException('Forbidden: Role modification requires administrative authority');
    }
  }

  /**
   * Prevents unauthorized verification status changes:
   * Verification status cannot be changed by the entity owner or normal users.
   */
  assertCanVerifyEntity(actor: JwtPayload, permission: PermissionKey): void {
    if (actor.roles?.includes(RoleType.SUPER_ADMIN)) {
      return;
    }
    if (!actor.permissions?.includes(permission)) {
      throw new ForbiddenException('Forbidden: Verification status can only be updated by authorized reviewers');
    }
  }

  private isSuperAdminOrAdmin(user: JwtPayload): boolean {
    return (
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN)
    );
  }
}
