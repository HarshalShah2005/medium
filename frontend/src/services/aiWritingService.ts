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
      let prompt = '';
      
      switch (request.type) {
        case 'continue':
          prompt = `Continue writing this blog post in a natural, engaging way. Keep the same tone and style:

${request.text}

Continue the text naturally (provide only the continuation, not the original text):`;
          break;
          
        case 'improve':
          prompt = `Improve this text to make it more engaging, clear, and well-written while keeping the same meaning:

${request.text}

Improved version:`;
          break;
          
        case 'rephrase':
          prompt = `Rephrase this text in a different way while keeping the same meaning:

${request.text}

Rephrased version:`;
          break;
          
        case 'summarize':
          prompt = `Summarize this text concisely:

${request.text}

Summary:`;
          break;
          
        default:
          prompt = `Continue writing this blog post in a natural, engaging way:

${request.text}

Continuation:`;
      }

      const response = await geminiService.generateContent(prompt);
      
      // Generate alternative suggestions
      const alternativePrompts = [
        `Provide an alternative way to ${request.type || 'continue'} this text: ${request.text}`,
        `Give another version of ${request.type || 'continuing'} this text: ${request.text}`
      ];
      
      const alternatives = await Promise.all(
        alternativePrompts.map((p: string) => geminiService.generateContent(p).catch(() => ''))
      );

      return {
        completion: response,
        suggestions: alternatives.filter((alt: string) => alt.trim().length > 0)
      };
    } catch (error) {
      console.error('Text completion error:', error);
      throw new Error('Failed to generate text completion. Please try again.');
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
      const prompt = `Based on this blog post content, suggest 5 engaging and SEO-friendly titles:

${content.substring(0, 500)}...

Provide only the titles, one per line:`;

      const response = await geminiService.generateContent(prompt);
      return response.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('Title suggestions error:', error);
      return [];
    }
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