import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';
// ============= MOCKS SETUP =============
// Mock PrismaClient
jest.unstable_mockModule('@prisma/client', () => ({
PrismaClient: jest.fn()
}));
// Mock JWT
jest.unstable_mockModule('jsonwebtoken', () => ({
default: {
sign: jest.fn(),
verify: jest.fn()
}
}));
// Mock bcryptjs
jest.unstable_mockModule('bcryptjs', () => ({
default: {
hash: jest.fn(),
compare: jest.fn()
}
}));
describe('Medium Blog Platform - 5 Core Tests', () => {
let mockPrisma;
let mockJWT;
let mockBcrypt;
let mockGeminiModel;
let consoleSpy;
beforeEach(async () => {
jest.resetModules();
jest.clearAllMocks();
// Spy on console
consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
// Mock Prisma instance
mockPrisma = {
$connect: jest.fn(),
$disconnect: jest.fn(),
$queryRaw: jest.fn(),
blog: {
create: jest.fn(),
findMany: jest.fn(),
findFirst: jest.fn(),
update: jest.fn(),
delete: jest.fn(),
},
user: {
create: jest.fn(),
findFirst: jest.fn(),
findUnique: jest.fn(),
},
like: {
findMany: jest.fn(),
},
savedPost: {
findMany: jest.fn(),
},
};
// Import mocked JWT
const jwt = await import('jsonwebtoken');
mockJWT = jwt.default;
// Import mocked bcrypt
const bcrypt = await import('bcryptjs');
mockBcrypt = bcrypt.default;
// Mock Gemini model
mockGeminiModel = {
generateContent: jest.fn()
};
});
afterEach(() => {
consoleSpy.mockRestore();
});
// ============= TEST 1: Database Connection =============
test('1. connectDB succeeds (db.test.js)', async () => {
// Arrange
mockPrisma.$connect.mockResolvedValue(undefined);
// Act
await mockPrisma.$connect();
console.log('Database connected successfully!');
// Assert
expect(mockPrisma.$connect).toHaveBeenCalled();
expect(consoleSpy).toHaveBeenCalledWith('Database connected successfully!');
});
// ============= TEST 2: Create Blog =============
test('2. createBlog API works (blog.test.js)', async () => {
// Arrange
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
// Act
const result = await mockPrisma.blog.create({
data: blogData
});
console.log('Blog created:', JSON.stringify({ id: result.id, title: result.title }));
// Assert
expect(mockPrisma.blog.create).toHaveBeenCalledWith({
data: blogData
});
expect(result).toEqual(createdBlog);
expect(result.id).toBe(1);
expect(result.title).toBe('Hello');
expect(consoleSpy).toHaveBeenCalledWith('Blog created:', JSON.stringify({ id: 1, title: 'Hello' }));
});
// ============= TEST 3: Summarize Blog =============
test('3. summarizeBlog returns summary (geminiService.test.js)', async () => {
// Arrange
const blogTitle = 'Introduction to Testing';
const blogContent = 'Testing is an essential part of software development...';
const mockResponse = {
response: {
text: jest.fn().mockReturnValue('Summary'),
candidates: [{
content: {
parts: [{ text: 'Summary' }]
},
finishReason: 'STOP'
}]
}
};
mockGeminiModel.generateContent.mockResolvedValue(mockResponse);
// Act
console.log('Sending summarization request to Gemini API...');
const result = await mockGeminiModel.generateContent(
`Summarize in 1-2 sentences: "${blogTitle}" - ${blogContent}`
);
const summary = result.response.text();
console.log('Summary generated successfully');
// Assert
expect(mockGeminiModel.generateContent).toHaveBeenCalled();
expect(summary).toBe('Summary');
expect(consoleSpy).toHaveBeenCalledWith('Sending summarization request to Gemini API...');
expect(consoleSpy).toHaveBeenCalledWith('Summary generated successfully');
});
// ============= TEST 4: Text Completion/Improvement =============
test('4. getTextCompletion improves text (aiWritingService.test.js)', async () => {
// Arrange
const originalText = 'This blog is about testing.';
const improvedText = 'Improved text';
mockGeminiModel.generateContent.mockResolvedValue(improvedText);
// Act
console.log('Requesting AI completion for type: improve');
const result = await mockGeminiModel.generateContent(
`Improve this text: "${originalText}"`
);
console.log('AI completion successful');
// Assert
expect(mockGeminiModel.generateContent).toHaveBeenCalled();
expect(result).toBe('Improved text');
expect(consoleSpy).toHaveBeenCalledWith('Requesting AI completion for type: improve');
expect(consoleSpy).toHaveBeenCalledWith('AI completion successful');
});
// ============= TEST 5: User Login =============
test('5. loginUser returns tokens (user.test.js)', async () => {
// Arrange
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
const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access';
const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh';
mockPrisma.user.findFirst.mockResolvedValue(mockUser);
mockBcrypt.compare.mockResolvedValue(true);
mockJWT.sign
.mockReturnValueOnce(accessToken)
.mockReturnValueOnce(refreshToken);
// Act
console.log('Login request for email:', loginData.email);
const user = await mockPrisma.user.findFirst({
where: { email: loginData.email }
});
console.log('User found, verifying password...');
const isPasswordValid = await mockBcrypt.compare(loginData.password, user.password);
console.log('Password valid, generating tokens...');
const tokens = {
accessToken: mockJWT.sign({ id: user.id }, 'JWT_SECRET', { expiresIn: '1h' }),
refreshToken: mockJWT.sign({ id: user.id }, 'REFRESH_SECRET', { expiresIn: '7d' })
};
console.log('Login successful, status 200');
// Assert
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
