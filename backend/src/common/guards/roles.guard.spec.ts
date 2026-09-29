import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RoleType } from '@al-husseiniya/types';

describe('RolesGuard (Criterion 5: Normal users cannot access admin endpoints)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
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

  it('should allow access if no roles are required on route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ roles: [RoleType.INDIVIDUAL] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should BLOCK normal user from accessing route requiring ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const context = createMockContext({ roles: [RoleType.INDIVIDUAL] });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should BLOCK moderator from accessing route requiring SUPER_ADMIN (Criterion 6)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.SUPER_ADMIN]);
    const context = createMockContext({ roles: [RoleType.MODERATOR] });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow ADMIN to access route requiring ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const context = createMockContext({ roles: [RoleType.ADMIN] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should always allow SUPER_ADMIN to access any protected role endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleType.ADMIN]);
    const context = createMockContext({ roles: [RoleType.SUPER_ADMIN] });
    expect(guard.canActivate(context)).toBe(true);
  });
});
