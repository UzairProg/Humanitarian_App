import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '@al-husseiniya/types';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
