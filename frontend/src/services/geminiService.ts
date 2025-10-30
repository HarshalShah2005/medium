import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export interface BlogSummary {
  summary: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // Remove quotes if present in the env variable
    const cleanApiKey = apiKey?.replace(/^["']|["']$/g, '').trim();
    
    if (cleanApiKey && cleanApiKey.length > 0) {
      this.apiKey = cleanApiKey;
      this.genAI = new GoogleGenerativeAI(cleanApiKey);
      console.log('Gemini API initialized successfully');
    } else {
      console.warn('Gemini API key not found. AI summaries will use fallback.');
    }
  }

  // Get the best available model for free tier
  private getBestModel(): string {
    // Use the most reliable free tier model
    // Valid models: 'gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'
    // gemini-1.5-flash is the best for free tier - fast and efficient
    return 'gemini-1.5-flash';
  }

  async summarizeBlog(blogContent: string, blogTitle: string): Promise<BlogSummary> {
    // If no API key, use fallback immediately
    if (!this.genAI || !this.apiKey) {
      console.log('No Gemini API key available, using fallback summary');
      return this.createFallbackSummary(blogTitle, blogContent);
    }

    try {
      // Get the best model for free tier
      const modelName = this.getBestModel();
      console.log('Using model for summarization:', modelName);

      // Clean HTML content - extract plain text
      const cleanContent = this.extractTextFromHTML(blogContent);

      // Limit content length strictly for free tier
      const limitedContent = cleanContent.slice(0, 800); // Reduced from 1500 to save tokens

      // Very simple prompt to minimize token usage
      const prompt = `Summarize in 1-2 sentences: "${blogTitle}" - ${limitedContent}`;

      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.3, // Lower for more predictable output
          maxOutputTokens: 80, // Reduced to save quota
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ]
      });

      console.log('Sending summarization request to Gemini API...');
      const result = await model.generateContent(prompt);
      
      console.log('Received summarization result');
      
      // Check for safety blocks or other issues
      if (!result || !result.response) {
        console.error('No response object from AI service for summarization');
        throw new Error('No response from AI service');
      }

      const response = result.response;
      
      // Check if the response was blocked
      if (response.promptFeedback?.blockReason) {
        console.error('Summarization response blocked:', response.promptFeedback.blockReason);
        throw new Error(`Content blocked: ${response.promptFeedback.blockReason}`);
      }

      // Check candidates
      if (!response.candidates || response.candidates.length === 0) {
        console.error('No candidates in summarization response');
        throw new Error('AI service returned no content candidates');
      }

      const candidate = response.candidates[0];
      
      // Check if candidate was blocked
      if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
        console.error('Summarization stopped with reason:', candidate.finishReason);
        throw new Error(`Content generation stopped: ${candidate.finishReason}`);
      }

      // Extract text
      let text = '';
      try {
        text = response.text();
      } catch (textError: any) {
        console.error('Error extracting summary text:', textError);
        
        // Try to extract text manually from candidate
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          text = candidate.content.parts.map((part: any) => part.text || '').join('');
        }
      }

      if (text && text.trim()) {
        console.log('Summary generated successfully, length:', text.length);
        return {
          summary: text.trim()
        };
      } else {
        console.error('Empty text after extraction in summarization');
        throw new Error('Empty response from API');
      }

    } catch (error) {
      console.error('Summarization failed - using fallback:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      // No retry attempts - go directly to fallback to preserve quota
      console.log('Using intelligent fallback to preserve quota');
      return this.createFallbackSummary(blogTitle, blogContent);
    }
  }

  private extractTextFromHTML(html: string): string {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());

    // Get text content and clean it up
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
  }

  private createFallbackSummary(title: string, content: string): BlogSummary {
    const cleanContent = this.extractTextFromHTML(content);
    const words = cleanContent.split(' ').slice(0, 50).join(' ');

    // Create a more intelligent fallback summary
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const firstSentence = sentences[0]?.trim() || '';
    const keyPoints = cleanContent.match(/\b(important|key|main|essential|crucial|significant)\b[^.!?]*[.!?]/gi) || [];

    let summary = '';

    if (firstSentence) {
      summary = `This blog post titled "${title}" ${firstSentence.toLowerCase()}`;
      if (keyPoints.length > 0 && keyPoints[0]) {
        summary += ` The post highlights ${keyPoints[0].toLowerCase()}`;
      }
      summary += ' This summary was generated automatically due to AI service limitations.';
    } else {
      summary = `This blog post about "${title}" covers topics related to ${words}... This summary was generated automatically due to AI service limitations.`;
    }

    return {
      summary: summary
    };
  }

  // Test API connection with minimal quota usage
  async testConnection(): Promise<boolean> {
    if (!this.genAI || !this.apiKey) {
      return false;
    }

    try {
      // Get the best model for free tier
      const testModel = this.getBestModel();
      console.log('Testing connection with model:', testModel);

      const model = this.genAI.getGenerativeModel({
        model: testModel,
        generationConfig: {
          maxOutputTokens: 10, // Minimal tokens for testing
        }
      });
      const result = await model.generateContent('Hi');
      const response = await result.response;
      const text = response.text();
      return text.length > 0;
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }

  // General content generation for AI writing assistance
  async generateContent(prompt: string, maxTokens: number = 200): Promise<string> {
    if (!this.genAI || !this.apiKey) {
      console.warn('Gemini API key not available');
      throw new Error('AI service is not configured. Please check your API key.');
    }

    try {
      // Get the best model for free tier
      const modelName = this.getBestModel();
      console.log('Generating content with model:', modelName);

      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ]
      });

      console.log('Sending prompt to Gemini API...');
      const result = await model.generateContent(prompt);
      
      console.log('Received result from Gemini API');
      console.log('Result:', JSON.stringify(result, null, 2));
      
      // Check for safety blocks or other issues
      if (!result || !result.response) {
        console.error('No response object from AI service');
        throw new Error('No response from AI service');
      }

      const response = result.response;
      
      // Check if the response was blocked
      if (response.promptFeedback?.blockReason) {
        console.error('Response blocked:', response.promptFeedback.blockReason);
        throw new Error(`Content blocked: ${response.promptFeedback.blockReason}. Please try rephrasing.`);
      }

      // Check candidates
      if (!response.candidates || response.candidates.length === 0) {
        console.error('No candidates in response');
        throw new Error('AI service returned no content candidates. Please try again.');
      }

      const candidate = response.candidates[0];
      
      // Check if candidate was blocked
      if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
        console.error('Content blocked with reason:', candidate.finishReason);
        throw new Error(`Content generation stopped: ${candidate.finishReason}. Please try rephrasing.`);
      }

      // Extract text from candidate
      let text = '';
      try {
        text = response.text();
      } catch (textError: any) {
        console.error('Error extracting text:', textError);
        
        // Try to extract text manually from candidate
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          text = candidate.content.parts.map((part: any) => part.text || '').join('');
        }
      }

      if (!text || text.trim().length === 0) {
        console.error('Empty text after extraction');
        console.error('Candidate:', JSON.stringify(candidate, null, 2));
        throw new Error('AI service returned empty content. This might be due to safety filters or quota limits. Please try rephrasing or try again later.');
      }

      console.log('Content generated successfully, length:', text.length);
      return text.trim();

    } catch (error: any) {
      console.error('Content generation failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        throw new Error('AI service quota exceeded. Please try again later or use a different API key.');
      } else if (error.message?.includes('API key') || error.message?.includes('401')) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
        throw new Error('Content blocked by safety filters. Please try rephrasing with different words.');
      } else if (error.message?.includes('RECITATION')) {
        throw new Error('Content flagged as potential plagiarism. Please try rephrasing.');
      } else if (error.message?.includes('empty content')) {
        throw error; // Re-throw our custom error with full message
      } else {
        throw new Error(error.message || 'Failed to generate content. Please try again.');
      }
    }
  }
}

export const geminiService = new GeminiService();