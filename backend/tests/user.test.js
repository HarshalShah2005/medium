import { jest, describe, test, beforeEach, expect } from '@jest/globals';

// Mock Modules
jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn()
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(),
    verify: jest.fn()
  }
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn()
  }
}));

describe('User Login Test', () => {
  let mockPrisma;
  let mockJWT;
  let mockBcrypt;
  let consoleSpy;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockPrisma = {
      user: {
        findFirst: jest.fn()
      }
    };

    const jwt = await import('jsonwebtoken');
    mockJWT = jwt.default;

    const bcrypt = await import('bcryptjs');
    mockBcrypt = bcrypt.default;
  });

  test('5. loginUser returns tokens (user.test.js)', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: '$2b$10$hashedpassword',
      name: 'Test User'
    };

    const accessToken = 'access.token.value';
    const refreshToken = 'refresh.token.value';

    mockPrisma.user.findFirst.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(true);
    mockJWT.sign
      .mockReturnValueOnce(accessToken)
      .mockReturnValueOnce(refreshToken);

    console.log('Login request for email:', loginData.email);

    const user = await mockPrisma.user.findFirst({
      where: { email: loginData.email }
    });

    console.log('User found, verifying password...');

    const isPasswordValid = await mockBcrypt.compare(
      loginData.password,
      user.password
    );

    console.log('Password valid, generating tokens...');

    const tokens = {
      accessToken: mockJWT.sign({ id: user.id }, 'JWT_SECRET', { expiresIn: '1h' }),
      refreshToken: mockJWT.sign({ id: user.id }, 'REFRESH_SECRET', { expiresIn: '7d' })
    };

    console.log('Login successful, status 200');

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'test@example.com' }
    });

    expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    expect(isPasswordValid).toBe(true);

    expect(tokens.accessToken).toBe(accessToken);
    expect(tokens.refreshToken).toBe(refreshToken);

    expect(consoleSpy).toHaveBeenCalledWith('Login successful, status 200');
  });
});
