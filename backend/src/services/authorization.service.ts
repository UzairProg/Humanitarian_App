import { JwtPayload, RoleType, PermissionKey } from '@al-husseiniya/types';
import { HumanitarianRequestDocument } from '../models/humanitarian-request.model';
import { AppError } from '../middleware/error.middleware';

export class AuthorizationService {
  /**
   * Object-level authorization for Humanitarian Requests:
   * Private requests can only be accessed by the owner or staff/admins with review permissions.
   */
  canAccessRequest(user: JwtPayload, request: HumanitarianRequestDocument): boolean {
    if (this.isSuperAdminOrAdmin(user)) {
      return true;
    }
    if (user.roles?.includes(RoleType.MODERATOR)) {
      return true;
    }
    if (request.requesterId === user.sub) {
      return true;
    }
    // Organization staff assigned/matched to the request
    if (
      user.orgId &&
      (request.organizationId === user.orgId || request.matchedOrganizationId === user.orgId)
    ) {
      return true;
    }
    // If request is public, allow read
    if (!request.isPrivate) {
      return true;
    }
    return false;
  }

  assertCanAccessRequest(user: JwtPayload, request: HumanitarianRequestDocument): void {
    if (!this.canAccessRequest(user, request)) {
      throw new AppError(
        'Access denied: You do not own or have authorization for this private request',
        403,
        'FORBIDDEN',
      );
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
      throw new AppError(
        'Access denied: You do not have membership privileges for this organization',
        403,
        'FORBIDDEN',
      );
    }
  }

  /**
   * Prevents privilege escalation:
   * Non-admins cannot assign, modify, or escalate roles.
   */
  assertCanAssignRoles(actor: JwtPayload): void {
    if (!this.isSuperAdminOrAdmin(actor)) {
      throw new AppError(
        'Forbidden: Role modification requires administrative authority',
        403,
        'FORBIDDEN',
      );
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
      throw new AppError(
        'Forbidden: Verification status can only be updated by authorized reviewers',
        403,
        'FORBIDDEN',
      );
    }
  }

  isSuperAdminOrAdmin(user: JwtPayload): boolean {
    return (
      user.roles?.includes(RoleType.SUPER_ADMIN) ||
      user.roles?.includes(RoleType.ADMIN)
    );
  }
}

export const authorizationService = new AuthorizationService();
