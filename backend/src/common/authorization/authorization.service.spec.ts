import { ForbiddenException } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { RoleType, PermissionKey, JwtPayload } from '@al-husseiniya/types';
import { HumanitarianRequest } from '../../database/schemas/humanitarian-request.schema';

describe('AuthorizationService (Security Matrix & Object-Level RBAC)', () => {
  let service: AuthorizationService;

  beforeEach(() => {
    service = new AuthorizationService();
  });

  const normalUser: JwtPayload = {
    sub: 'user-uuid-1',
    email: 'user1@alhusseiniya.org',
    roles: [RoleType.INDIVIDUAL],
    permissions: [PermissionKey.REQUEST_CREATE, PermissionKey.REQUEST_VIEW],
  };

  const otherUser: JwtPayload = {
    sub: 'user-uuid-2',
    email: 'user2@alhusseiniya.org',
    roles: [RoleType.INDIVIDUAL],
    permissions: [PermissionKey.REQUEST_CREATE, PermissionKey.REQUEST_VIEW],
  };

  const moderatorUser: JwtPayload = {
    sub: 'mod-uuid-1',
    email: 'moderator@alhusseiniya.org',
    roles: [RoleType.MODERATOR],
    permissions: [PermissionKey.REPORT_VIEW, PermissionKey.REPORT_RESOLVE],
  };

  const adminUser: JwtPayload = {
    sub: 'admin-uuid-1',
    email: 'admin@alhusseiniya.org',
    roles: [RoleType.ADMIN],
    permissions: [PermissionKey.USER_MANAGE, PermissionKey.ORGANIZATION_VERIFY],
  };

  const superAdminUser: JwtPayload = {
    sub: 'superadmin-uuid-1',
    email: 'superadmin@alhusseiniya.org',
    roles: [RoleType.SUPER_ADMIN],
    permissions: Object.values(PermissionKey),
  };

  describe('Criterion 1 & 8: Private Request Access and ID Tampering Prevention', () => {
    const privateRequest: HumanitarianRequest = {
      _id: 'req-uuid-1',
      id: 'req-uuid-1',
      requesterId: 'user-uuid-1',
      categoryId: 'cat-uuid-1',
      title: 'Emergency Aid Request',
      description: 'Private medical and food need',
      location: 'Sector 4',
      status: 'SUBMITTED' as any,
      priority: 'HIGH' as any,
      isPrivate: true,
    };

    it('should allow the owner to access their own private request', () => {
      expect(service.canAccessRequest(normalUser, privateRequest)).toBe(true);
      expect(() => service.assertCanAccessRequest(normalUser, privateRequest)).not.toThrow();
    });

    it('should block another user from accessing a private request (Prevent ID tampering)', () => {
      expect(service.canAccessRequest(otherUser, privateRequest)).toBe(false);
      expect(() => service.assertCanAccessRequest(otherUser, privateRequest)).toThrow(
        ForbiddenException,
      );
    });

    it('should allow moderators and administrators to inspect private requests for verification', () => {
      expect(service.canAccessRequest(moderatorUser, privateRequest)).toBe(true);
      expect(service.canAccessRequest(adminUser, privateRequest)).toBe(true);
      expect(service.canAccessRequest(superAdminUser, privateRequest)).toBe(true);
    });
  });

  describe('Criterion 3: Organization A cannot access Organization B private data', () => {
    const orgAId = 'org-a-uuid';
    const orgBId = 'org-b-uuid';

    it('should allow Org A member to access Org A data', () => {
      expect(service.canAccessOrganization(normalUser, orgAId, [orgAId])).toBe(true);
      expect(() => service.assertCanAccessOrganization(normalUser, orgAId, [orgAId])).not.toThrow();
    });

    it('should BLOCK Org A member from accessing Org B private data', () => {
      expect(service.canAccessOrganization(normalUser, orgBId, [orgAId])).toBe(false);
      expect(() =>
        service.assertCanAccessOrganization(normalUser, orgBId, [orgAId]),
      ).toThrow(ForbiddenException);
    });

    it('should allow SuperAdmin and Admin to access organization records for oversight', () => {
      expect(service.canAccessOrganization(superAdminUser, orgBId, [])).toBe(true);
      expect(service.canAccessOrganization(adminUser, orgBId, [])).toBe(true);
    });
  });

  describe('Criterion 2 & 6: Role Escalation and Privilege Boundary', () => {
    it('should BLOCK normal users from assigning or modifying roles', () => {
      expect(() => service.assertCanAssignRoles(normalUser)).toThrow(ForbiddenException);
    });

    it('should BLOCK moderators from performing admin role management', () => {
      expect(() => service.assertCanAssignRoles(moderatorUser)).toThrow(ForbiddenException);
    });

    it('should allow Admins and SuperAdmins to manage roles', () => {
      expect(() => service.assertCanAssignRoles(adminUser)).not.toThrow();
      expect(() => service.assertCanAssignRoles(superAdminUser)).not.toThrow();
    });
  });

  describe('Criterion 7: Verification status cannot be changed by unauthorized users', () => {
    it('should BLOCK normal users from approving organization verification', () => {
      expect(() =>
        service.assertCanVerifyEntity(normalUser, PermissionKey.ORGANIZATION_VERIFY),
      ).toThrow(ForbiddenException);
    });

    it('should BLOCK moderators without specific verification permission', () => {
      expect(() =>
        service.assertCanVerifyEntity(moderatorUser, PermissionKey.ORGANIZATION_VERIFY),
      ).toThrow(ForbiddenException);
    });

    it('should allow users possessing the verification permission', () => {
      expect(() =>
        service.assertCanVerifyEntity(adminUser, PermissionKey.ORGANIZATION_VERIFY),
      ).not.toThrow();
    });

    it('should allow SuperAdmin', () => {
      expect(() =>
        service.assertCanVerifyEntity(superAdminUser, PermissionKey.ORGANIZATION_VERIFY),
      ).not.toThrow();
    });
  });
});
