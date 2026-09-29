import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserModel } from '../../models/user.model';
import { auditService } from '../../services/audit.service';
import { RoleType } from '@al-husseiniya/types';

describe('AuthService (Criterion 10: Password Hashing & Exposure Prevention)', () => {
  let service: AuthService;

  const mockCreatedUser: any = {
    _id: 'user-123',
    id: 'user-123',
    email: 'newuser@alhusseiniya.org',
    passwordHash: 'hashed_password_string',
    firstName: 'New',
    lastName: 'User',
    roles: [RoleType.INDIVIDUAL],
    toJSON: function () {
      const { passwordHash, ...rest } = this;
      return rest;
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    jest.spyOn(auditService, 'record').mockResolvedValue(null);
  });

  it('should NEVER return password or passwordHash in registration output (Criterion 10)', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValue(null as any);
    jest.spyOn(UserModel, 'create').mockResolvedValue(mockCreatedUser as any);

    const result = await service.register({
      email: 'newuser@alhusseiniya.org',
      password: 'StrongSecretPassword123!',
      firstName: 'New',
      lastName: 'User',
    });

    expect(result.user).toBeDefined();
    expect((result.user as any).password).toBeUndefined();
    expect((result.user as any).passwordHash).toBeUndefined();
  });

  it('should always hash passwords securely with bcrypt before persisting', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValue(null as any);
    const createSpy = jest.spyOn(UserModel, 'create').mockResolvedValue(mockCreatedUser as any);

    const rawPassword = 'PlainSecretPassword123!';
    await service.register({
      email: 'newuser2@alhusseiniya.org',
      password: rawPassword,
      firstName: 'New',
      lastName: 'User',
    });

    expect(createSpy).toHaveBeenCalled();
    const createdArg = createSpy.mock.calls[0][0];

    // Password must be hashed (not plaintext)
    expect(createdArg.passwordHash).not.toEqual(rawPassword);
    // Must be a valid bcrypt hash that verifies with rawPassword
    const matches = await bcrypt.compare(rawPassword, createdArg.passwordHash);
    expect(matches).toBe(true);
  });

  it('should assign INDIVIDUAL role by default and prevent self-escalation (Criterion 2)', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValue(null as any);
    jest.spyOn(UserModel, 'create').mockResolvedValue(mockCreatedUser as any);

    const result = await service.register({
      email: 'newuser3@alhusseiniya.org',
      password: 'StrongSecretPassword123!',
      firstName: 'New',
      lastName: 'User',
    });

    expect(result.roles).toEqual([RoleType.INDIVIDUAL]);
    expect(result.roles).not.toContain(RoleType.ADMIN);
    expect(result.roles).not.toContain(RoleType.SUPER_ADMIN);
  });
});
