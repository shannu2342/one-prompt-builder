import axios, { AxiosInstance } from 'axios';

export interface GrokConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class GrokClient {
  private client: AxiosInstance | null = null;
  private config: GrokConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GROK_API_KEY || '',
      apiUrl: process.env.GROK_API_URL || 'https://api.x.ai/v1',
      model: 'grok-beta',
      maxTokens: 8000,
      temperature: 0.7,
    };

    // Don't throw error on initialization, only when trying to use the API
    if (this.config.apiKey) {
      this.initializeClient();
    } else {
      console.warn('⚠️  GROK_API_KEY is not set. AI generation features will not work until you add your API key to the .env file.');
    }
  }

  private initializeClient(): void {
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minutes timeout
    });
  }

  async generateCompletion(prompt: string, options?: Partial<GrokConfig>): Promise<string> {
    if (!this.config.apiKey || !this.client) {
      throw new Error('GROK_API_KEY is not configured. Please add your Grok API key to the .env file and restart the server.');
    }

    try {
      const response = await this.client.post('/chat/completions', {
        model: options?.model || this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert full-stack developer and code generator. Generate clean, production-ready, well-structured code based on user requirements. Always return valid JSON when requested.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
      });

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('Grok API Error:', error.response?.data || error.message);
      throw new Error(`Grok API request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  getConfig(): GrokConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

export const grokClient = new GrokClient();
