import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard (Criterion 4: Unauthenticated users cannot access protected endpoints)', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should allow access to endpoints decorated with @Public()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when no user is present in handleRequest', () => {
    expect(() => guard.handleRequest(null, null, null)).toThrow(
      UnauthorizedException,
    );
  });

  it('should return user object when authenticated user is present', () => {
    const user = { sub: 'user-1', email: 'test@example.com' };
    expect(guard.handleRequest(null, user, null)).toBe(user);
  });
});
