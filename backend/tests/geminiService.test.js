import { jest, describe, test, beforeEach, expect } from '@jest/globals';

describe('Gemini Blog Summarization Test', () => {
  let mockGeminiModel;
  let consoleSpy;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockGeminiModel = {
      generateContent: jest.fn()
    };
  });

  test('3. summarizeBlog returns summary (geminiService.test.js)', async () => {
    const blogTitle = 'Introduction to Testing';
    const blogContent = 'Testing is an essential part of software development...';

    const mockResponse = {
      response: {
        text: jest.fn().mockReturnValue('Summary'),
        candidates: [
          {
            content: { parts: [{ text: 'Summary' }] },
            finishReason: 'STOP'
          }
        ]
      }
    };

    mockGeminiModel.generateContent.mockResolvedValue(mockResponse);

    console.log('Sending summarization request to Gemini API...');

    const result = await mockGeminiModel.generateContent(
      `Summarize in 1-2 sentences: "${blogTitle}" - ${blogContent}`
    );

    const summary = result.response.text();

    console.log('Summary generated successfully');

    expect(mockGeminiModel.generateContent).toHaveBeenCalled();
    expect(summary).toBe('Summary');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Sending summarization request to Gemini API...'
    );
    expect(consoleSpy).toHaveBeenCalledWith('Summary generated successfully');
  });
});
