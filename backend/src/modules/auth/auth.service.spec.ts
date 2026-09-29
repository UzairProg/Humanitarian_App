import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
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

  const mockUserModel: any = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn().mockImplementation((doc: any) => Promise.resolve({
      ...mockCreatedUser,
      ...doc,
      toJSON: function () {
        const { passwordHash, ...rest } = this;
        return rest;
      },
    })),
  };

  const mockRoleModel: any = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockOrgMemberModel: any = {
    findOne: jest.fn(),
  };

  const mockJwtService: any = {
    signAsync: jest.fn().mockResolvedValue('mock_jwt_token'),
    verify: jest.fn(),
  };

  const mockConfigService: any = {
    get: jest.fn().mockImplementation((key: string, def: any) => def),
  };

  const mockAuditService: any = {
    record: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      mockUserModel,
      mockRoleModel,
      mockOrgMemberModel,
      mockJwtService,
      mockConfigService,
      mockAuditService,
    );
  });

  it('should NEVER return password or passwordHash in registration output (Criterion 10)', async () => {
    mockUserModel.findOne.mockResolvedValue(null);

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
    mockUserModel.findOne.mockResolvedValue(null);

    const rawPassword = 'PlainSecretPassword123!';
    await service.register({
      email: 'newuser2@alhusseiniya.org',
      password: rawPassword,
      firstName: 'New',
      lastName: 'User',
    });

    expect(mockUserModel.create).toHaveBeenCalled();
    const createdArg = mockUserModel.create.mock.calls[0][0];

    // Password must be hashed (not plaintext)
    expect(createdArg.passwordHash).not.toEqual(rawPassword);
    // Must be a valid bcrypt hash that verifies with rawPassword
    const matches = await bcrypt.compare(rawPassword, createdArg.passwordHash);
    expect(matches).toBe(true);
  });

  it('should assign INDIVIDUAL role by default and prevent self-escalation (Criterion 2)', async () => {
    mockUserModel.findOne.mockResolvedValue(null);

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
