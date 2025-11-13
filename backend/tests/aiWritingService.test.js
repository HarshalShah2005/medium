import { jest, describe, test, beforeEach, expect } from '@jest/globals';

describe('AI Writing Service - Text Improvement Test', () => {
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

  test('4. getTextCompletion improves text (aiWritingService.test.js)', async () => {
    const originalText = 'This blog is about testing.';
    const improvedText = 'Improved text';

    mockGeminiModel.generateContent.mockResolvedValue(improvedText);

    console.log('Requesting AI completion for type: improve');

    const result = await mockGeminiModel.generateContent(
      `Improve this text: "${originalText}"`
    );

    console.log('AI completion successful');

    expect(mockGeminiModel.generateContent).toHaveBeenCalled();
    expect(result).toBe('Improved text');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Requesting AI completion for type: improve'
    );
    expect(consoleSpy).toHaveBeenCalledWith('AI completion successful');
  });
});
