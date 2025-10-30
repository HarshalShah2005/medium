import { GoogleGenerativeAI } from '@google/generative-ai';

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
    // gemini-1.5-flash is the most stable and widely available free model
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
      console.log('Using model:', modelName);

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
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text && text.trim()) {
        return {
          summary: text.trim()
        };
      } else {
        throw new Error('Empty response from API');
      }

    } catch (error) {
      console.error('Model failed - quota likely exceeded, using fallback:', error);

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
      console.warn('Gemini API key not available, returning empty response');
      return '';
    }

    try {
      // Get the best model for free tier
      const modelName = this.getBestModel();

      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text.trim();

    } catch (error) {
      console.error('Content generation failed:', error);
      return '';
    }
  }
}

export const geminiService = new GeminiService();