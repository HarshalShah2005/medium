import { GoogleGenerativeAI } from '@google/generative-ai';

export interface BlogSummary {
  summary: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      this.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn('Gemini API key not found. AI summaries will use fallback.');
    }
  }

  // List available models and filter for best free tier option
  async listAvailableModels(): Promise<string[]> {
    if (!this.genAI || !this.apiKey) {
      return [];
    }
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      const data = await response.json();
      
      if (data.models) {
        const allModels = data.models
          .filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
          .map((model: any) => model.name.replace('models/', ''));
        
        // Prioritize the most efficient free tier models to avoid quota issues
        const preferredModels = [
          'gemini-2.5-flash-lite',
          'gemini-2.0-flash-lite',
          'gemini-2.5-flash',
          'gemini-2.0-flash'
        ];
        
        // Find the first available preferred model
        for (const preferred of preferredModels) {
          if (allModels.includes(preferred)) {
            console.log('Using preferred efficient model:', preferred);
            return [preferred]; // Return only one model to avoid quota exhaustion
          }
        }
        
        // If no preferred models, use the first available one
        console.log('Using first available model:', allModels[0]);
        return allModels.slice(0, 1); // Return only one model
      }
      return [];
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }

  async summarizeBlog(blogContent: string, blogTitle: string): Promise<BlogSummary> {
    // If no API key, use fallback immediately
    if (!this.genAI || !this.apiKey) {
      console.log('No Gemini API key available, using fallback summary');
      return this.createFallbackSummary(blogTitle, blogContent);
    }

    try {
      // Get the single best model for free tier
      const availableModels = await this.listAvailableModels();
      
      if (availableModels.length === 0) {
        console.warn('No available models found, using fallback');
        return this.createFallbackSummary(blogTitle, blogContent);
      }

      // Use only the first (best) available model - no fallback attempts to preserve quota
      const modelName = availableModels[0];
      console.log('Using single model to preserve quota:', modelName);

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
      // Get the single best model for free tier
      const availableModels = await this.listAvailableModels();
      
      if (availableModels.length === 0) {
        console.error('No available models found');
        return false;
      }
      
      // Use the single recommended model
      const testModel = availableModels[0];
      console.log('Testing connection with quota-efficient model:', testModel);
      
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
      // Get the single best model for free tier
      const availableModels = await this.listAvailableModels();
      
      if (availableModels.length === 0) {
        console.warn('No available models found');
        return '';
      }

      const modelName = availableModels[0];
      
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