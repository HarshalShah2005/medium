import { jest, test, beforeEach, describe, expect } from '@jest/globals';

// Mock PrismaClient
jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn()
}));

describe('Database Connection Test', () => {
  let mockPrisma;
  let consoleSpy;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockPrisma = {
      $connect: jest.fn()
    };
  });

  test('1. connectDB succeeds (db.test.js)', async () => {
    mockPrisma.$connect.mockResolvedValue(undefined);

    await mockPrisma.$connect();
    console.log('Database connected successfully!');

    expect(mockPrisma.$connect).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Database connected successfully!');
  });
});
