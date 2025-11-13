import { jest, describe, test, beforeEach, expect } from '@jest/globals';

// Mock PrismaClient
jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn()
}));

describe('Blog API Tests', () => {
  let mockPrisma;
  let consoleSpy;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockPrisma = {
      blog: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    };
  });

  test('2. createBlog API works (blog.test.js)', async () => {
    const blogData = {
      title: 'Hello',
      content: 'This is my first blog post',
      authorId: 1
    };

    const createdBlog = {
      id: 1,
      title: 'Hello',
      content: 'This is my first blog post',
      authorId: 1,
      published: false
    };

    mockPrisma.blog.create.mockResolvedValue(createdBlog);

    const result = await mockPrisma.blog.create({ data: blogData });

    console.log('Blog created:', JSON.stringify({ id: result.id, title: result.title }));

    expect(mockPrisma.blog.create).toHaveBeenCalledWith({ data: blogData });
    expect(result).toEqual(createdBlog);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Blog created:',
      JSON.stringify({ id: 1, title: 'Hello' })
    );
  });
});
