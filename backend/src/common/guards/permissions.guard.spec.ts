import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PermissionKey, RoleType } from '@al-husseiniya/types';

describe('PermissionsGuard (Granular Capability Enforcement)', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  function createMockContext(user: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  it('should allow access when user possesses the required permission', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([PermissionKey.ORGANIZATION_VERIFY]);

    const context = createMockContext({
      roles: [RoleType.ADMIN],
      permissions: [PermissionKey.ORGANIZATION_VERIFY],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should BLOCK user when required permission is missing', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([PermissionKey.ORGANIZATION_VERIFY]);

    const context = createMockContext({
      roles: [RoleType.INDIVIDUAL],
      permissions: [PermissionKey.REQUEST_CREATE],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should automatically allow SUPER_ADMIN regardless of explicit permission array', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([PermissionKey.AUDIT_VIEW]);

    const context = createMockContext({
      roles: [RoleType.SUPER_ADMIN],
      permissions: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });
});
