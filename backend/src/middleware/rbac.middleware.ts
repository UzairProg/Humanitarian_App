import { Request, Response, NextFunction } from 'express';
import { RoleType, PermissionKey } from '@al-husseiniya/types';

export function requireRoles(...roles: RoleType[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (req.user.roles?.includes(RoleType.SUPER_ADMIN)) {
      return next();
    }

    const hasRequiredRole = roles.some((r) => req.user?.roles?.includes(r));
    if (!hasRequiredRole) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: Insufficient role permissions',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

export function requirePermissions(...permissions: PermissionKey[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (req.user.roles?.includes(RoleType.SUPER_ADMIN)) {
      return next();
    }

    const hasAllPermissions = permissions.every((p) => req.user?.permissions?.includes(p));
    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: Insufficient action permissions',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
