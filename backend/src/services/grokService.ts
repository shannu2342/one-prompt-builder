import { grokClient } from '../config/grok';

export interface GenerationRequest {
  prompt: string;
  type: 'website' | 'mobile-app';
  framework?: string;
  features?: string[];
}

export interface GeneratedCode {
  type: string;
  framework: string;
  files: {
    [key: string]: string;
  };
  dependencies?: {
    [key: string]: string;
  };
  structure?: string[];
  instructions?: string;
}

export class GrokService {
  async generateProject(request: GenerationRequest): Promise<GeneratedCode> {
    const { prompt, type, framework } = request;

    let systemPrompt = '';
    
    if (type === 'website') {
      systemPrompt = this.getWebsitePrompt(framework || 'html', prompt);
    } else if (type === 'mobile-app') {
      systemPrompt = this.getMobileAppPrompt(framework || 'react-native', prompt);
    }

    try {
      const response = await grokClient.generateCompletion(systemPrompt);
      
      // Parse the JSON response
      const parsedCode = this.parseGeneratedCode(response);
      
      return parsedCode;
    } catch (error: any) {
      console.error('Error generating project:', error);
      throw new Error(`Failed to generate project: ${error.message}`);
    }
  }

  private getWebsitePrompt(framework: string, userPrompt: string): string {
    const basePrompt = `Generate a complete, production-ready ${framework} website based on this requirement: "${userPrompt}"

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):

{
  "type": "website",
  "framework": "${framework}",
  "files": {
    "index.html": "<!DOCTYPE html>...",
    "styles.css": "/* CSS code */",
    "script.js": "// JavaScript code",
    "package.json": "{ ... }" (if applicable)
  },
  "dependencies": {
    "package-name": "version"
  },
  "structure": ["index.html", "styles.css", "script.js"],
  "instructions": "Setup and deployment instructions"
}

Requirements:
1. Generate complete, working code for all files
2. Include modern, responsive design with CSS
3. Add interactive JavaScript functionality
4. Follow best practices and clean code principles
5. Make it production-ready with proper error handling
6. Include comments explaining key sections
7. Ensure cross-browser compatibility
8. Add meta tags for SEO if HTML

Generate the complete project now:`;

    return basePrompt;
  }

  private getMobileAppPrompt(framework: string, userPrompt: string): string {
    const basePrompt = `Generate a complete, production-ready ${framework} mobile app based on this requirement: "${userPrompt}"

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just raw JSON):

{
  "type": "mobile-app",
  "framework": "${framework}",
  "files": {
    "App.js": "import React from 'react'...",
    "package.json": "{ ... }",
    "app.json": "{ ... }",
    "screens/HomeScreen.js": "...",
    "components/Header.js": "...",
    "navigation/AppNavigator.js": "..."
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.0",
    "@react-navigation/native": "^6.0.0"
  },
  "structure": ["App.js", "screens/", "components/", "navigation/"],
  "instructions": "Setup: npm install && npx expo start"
}

Requirements:
1. Generate complete React Native code with Expo
2. Include proper navigation setup
3. Create reusable components
4. Add proper styling with StyleSheet
5. Include error boundaries
6. Follow React Native best practices
7. Make it production-ready
8. Add comments for clarity

Generate the complete mobile app project now:`;

    return basePrompt;
  }

  private parseGeneratedCode(response: string): GeneratedCode {
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();
      
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      const parsed = JSON.parse(cleanedResponse);
      
      // Validate required fields
      if (!parsed.type || !parsed.framework || !parsed.files) {
        throw new Error('Invalid generated code structure');
      }

      return parsed as GeneratedCode;
    } catch (error: any) {
      console.error('Error parsing generated code:', error);
      console.error('Raw response:', response);
      
      // Fallback: create a basic structure
      return {
        type: 'website',
        framework: 'html',
        files: {
          'index.html': response,
        },
        structure: ['index.html'],
        instructions: 'Manual setup required',
      };
    }
  }

  async enhanceCode(existingCode: any, enhancementPrompt: string): Promise<GeneratedCode> {
    const prompt = `Enhance the following code based on this request: "${enhancementPrompt}"

Existing code:
${JSON.stringify(existingCode, null, 2)}

Return the enhanced code in the same JSON structure format.`;

    try {
      const response = await grokClient.generateCompletion(prompt);
      return this.parseGeneratedCode(response);
    } catch (error: any) {
      throw new Error(`Failed to enhance code: ${error.message}`);
    }
  }
}

export const grokService = new GrokService();
