import { geminiService } from './geminiService';

// LanguageTool API for grammar checking (free public API)
const LANGUAGETOOL_API = 'https://api.languagetool.org/v2/check';

export interface GrammarSuggestion {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: Array<{ value: string }>;
  ruleId: string;
  category: string;
  ruleIssueType: string;
}

export interface GrammarCheckResult {
  matches: GrammarSuggestion[];
  language: {
    code: string;
    name: string;
  };
}

export interface TextCompletionRequest {
  text: string;
  context?: string;
  type?: 'continue' | 'improve' | 'rephrase' | 'summarize';
}

export interface TextCompletionResult {
  completion: string;
  suggestions: string[];
}

class AIWritingService {
  
  /**
   * Check grammar and spelling using LanguageTool
   */
  async checkGrammar(text: string, language: string = 'en-US'): Promise<GrammarCheckResult> {
    try {
      // Use URLSearchParams instead of FormData for better compatibility
      const params = new URLSearchParams();
      params.append('text', text);
      params.append('language', language);
      params.append('enabledOnly', 'false');
      
      const response = await fetch(LANGUAGETOOL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LanguageTool API Error:', response.status, errorText);
        // Fall back to basic grammar check
        return this.basicGrammarCheck(text);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Grammar check error:', error);
      // Fall back to basic grammar check
      return this.basicGrammarCheck(text);
    }
  }

  /**
   * Basic grammar check fallback when LanguageTool is unavailable
   */
  private basicGrammarCheck(text: string): GrammarCheckResult {
    const matches: GrammarSuggestion[] = [];
    
    // Common spelling mistakes and corrections
    const commonMistakes = [
      { wrong: 'teh', correct: 'the' },
      { wrong: 'recieve', correct: 'receive' },
      { wrong: 'occurence', correct: 'occurrence' },
      { wrong: 'seperate', correct: 'separate' },
      { wrong: 'definately', correct: 'definitely' },
      { wrong: 'accomodate', correct: 'accommodate' },
      { wrong: 'neccessary', correct: 'necessary' },
      { wrong: 'existance', correct: 'existence' },
      { wrong: 'beleive', correct: 'believe' },
      { wrong: 'begining', correct: 'beginning' },
    ];

    // Check for common mistakes
    commonMistakes.forEach(mistake => {
      const regex = new RegExp(`\\b${mistake.wrong}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          message: `Possible spelling mistake: "${mistake.wrong}" → "${mistake.correct}"`,
          shortMessage: 'Spelling',
          offset: match.index,
          length: mistake.wrong.length,
          replacements: [{ value: mistake.correct }],
          ruleId: 'basic-spelling',
          category: 'TYPOS',
          ruleIssueType: 'misspelling'
        });
      }
    });

    return {
      matches,
      language: { code: 'en-US', name: 'English (Basic Check)' }
    };
  }

  /**
   * Get text completions using Gemini AI
   */
  async getTextCompletion(request: TextCompletionRequest): Promise<TextCompletionResult> {
    try {
      if (!request.text || request.text.trim().length === 0) {
        throw new Error('No text provided for completion');
      }

      if (request.text.trim().length < 10) {
        throw new Error('Please provide more text (at least 10 characters)');
      }

      // Limit text length to avoid quota issues
      const limitedText = request.text.substring(0, 800);
      let prompt = '';
      let maxTokens = 250;
      
      switch (request.type) {
        case 'continue':
          prompt = `Continue this text naturally. Write 2-3 more sentences that flow naturally from the existing text. Provide ONLY the continuation without repeating the original text:\n\n"${limitedText}"\n\nContinuation:`;
          maxTokens = 150;
          break;
          
        case 'improve':
          prompt = `Improve this text to make it more engaging, clear, and professional. Maintain the same meaning but enhance the writing quality. Provide ONLY the improved version:\n\n"${limitedText}"\n\nImproved version:`;
          maxTokens = 300;
          break;
          
        case 'rephrase':
          prompt = `Rephrase this text using different words while keeping exactly the same meaning. Provide ONLY the rephrased version:\n\n"${limitedText}"\n\nRephrased:`;
          maxTokens = 250;
          break;
          
        case 'summarize':
          prompt = `Summarize this text in 2-3 clear sentences:\n\n"${limitedText}"\n\nSummary:`;
          maxTokens = 150;
          break;
          
        default:
          prompt = `Continue this text naturally (2-3 sentences):\n\n"${limitedText}"\n\nContinuation:`;
          maxTokens = 150;
      }

      console.log('Requesting AI completion for type:', request.type);
      const response = await geminiService.generateContent(prompt, maxTokens);
      
      if (!response || response.trim().length === 0) {
        throw new Error('AI service returned an empty response. Please try again or check your API quota.');
      }

      console.log('AI completion successful, response length:', response.length);

      // For better results, only get one main suggestion to save quota
      // Don't generate multiple alternatives to avoid quota exhaustion
      return {
        completion: response.trim(),
        suggestions: [] // Simplified to avoid quota issues
      };
    } catch (error) {
      console.error('Text completion error:', error);
      if (error instanceof Error) {
        throw error; // Re-throw the original error with its message
      }
      throw new Error('Failed to generate text completion. Please check your internet connection and try again.');
    }
  }

  /**
   * Get writing suggestions for a specific selection
   */
  async getWritingSuggestions(text: string, selectedText: string): Promise<string[]> {
    try {
      const prompt = `Given this context: "${text}"
      
Provide 3 different ways to improve or rephrase this selected text: "${selectedText}"

Return only the suggestions, one per line:`;

      const response = await geminiService.generateContent(prompt);
      return response.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 3);
    } catch (error) {
      console.error('Writing suggestions error:', error);
      return [];
    }
  }

  /**
   * Auto-correct common spelling mistakes and typos
   */
  async autoCorrect(text: string): Promise<string> {
    try {
      const grammarResult = await this.checkGrammar(text);
      
      // If no matches found, return original text
      if (!grammarResult.matches || grammarResult.matches.length === 0) {
        return text;
      }
      
      let correctedText = text;
      
      // Apply corrections from end to start to maintain correct positions
      const corrections = grammarResult.matches
        .filter(match => match.ruleIssueType === 'misspelling' || match.ruleIssueType === 'typographical')
        .sort((a, b) => b.offset - a.offset);
      
      for (const correction of corrections) {
        if (correction.replacements && correction.replacements.length > 0) {
          const replacement = correction.replacements[0].value;
          correctedText = 
            correctedText.substring(0, correction.offset) +
            replacement +
            correctedText.substring(correction.offset + correction.length);
        }
      }
      
      return correctedText;
    } catch (error) {
      console.error('Auto-correct error:', error);
      return text; // Return original text if correction fails
    }
  }

  /**
   * Get title suggestions based on content
   */
  async getTitleSuggestions(content: string): Promise<string[]> {
    try {
      if (!content || content.trim().length === 0) {
        console.warn('No content provided for title suggestions');
        return [];
      }

      // Limit content length
      const limitedContent = content.substring(0, 500);
      
      const prompt = `Based on this blog post content, suggest 5 engaging and SEO-friendly titles. Return ONLY the titles, one per line, without numbering or extra formatting:

Content: ${limitedContent}

Titles:`;

      const response = await geminiService.generateContent(prompt, 300);
      
      if (!response || response.trim().length === 0) {
        console.warn('Empty response from Gemini for title suggestions');
        return this.generateFallbackTitles(limitedContent);
      }

      // Clean up the response - remove numbering, bullets, quotes
      const titles = response
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => {
          // Remove common prefixes like "1.", "•", "-", quotes
          return line.replace(/^[\d\.\-\•\*]+\s*/, '').replace(/^["']|["']$/g, '').trim();
        })
        .filter((line: string) => line.length > 10) // Filter out very short lines
        .slice(0, 5);

      if (titles.length === 0) {
        return this.generateFallbackTitles(limitedContent);
      }

      return titles;
    } catch (error) {
      console.error('Title suggestions error:', error);
      return this.generateFallbackTitles(content.substring(0, 500));
    }
  }

  /**
   * Generate fallback title suggestions when AI is unavailable
   */
  private generateFallbackTitles(content: string): string[] {
    const words = content.split(' ').filter(w => w.length > 3).slice(0, 20);
    const uniqueWords = [...new Set(words)].slice(0, 5);
    
    return [
      `Understanding ${uniqueWords[0] || 'This Topic'}`,
      `A Guide to ${uniqueWords[1] || 'This Subject'}`,
      `Everything You Need to Know About ${uniqueWords[2] || 'This'}`,
      `${uniqueWords[3] || 'Insights'}: A Comprehensive Overview`,
      `The Complete Guide to ${uniqueWords[4] || 'This Topic'}`
    ].filter(title => title.length > 10);
  }

  /**
   * Get content outline suggestions
   */
  async getOutlineSuggestions(topic: string): Promise<string[]> {
    try {
      const prompt = `Create a blog post outline for the topic: "${topic}"

Provide 5-7 main sections/headings that would make a comprehensive blog post:`;

      const response = await geminiService.generateContent(prompt);
      return response.split('\n').filter((line: string) => line.trim().length > 0);
    } catch (error) {
      console.error('Outline suggestions error:', error);
      return [];
    }
  }
}

export const aiWritingService = new AIWritingService();