import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GeminiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private embeddingModelName: string;
  private chatModelName: string;
  private chatModel: GenerativeModel;
  private readonly logger = new Logger(GeminiService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. AI features will be unavailable.');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModelName = this.configService.get<string>('gemini.embeddingModel') || 'text-embedding-004';
    this.chatModelName = this.configService.get<string>('gemini.chatModel') || 'gemini-2.0-flash';
    this.chatModel = this.genAI.getGenerativeModel({ model: this.chatModelName });
    this.logger.log('Gemini AI initialized successfully');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.genAI) {
      throw new Error('Gemini AI is not initialized. Check GEMINI_API_KEY.');
    }

    const model = this.genAI.getGenerativeModel({ model: this.embeddingModelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async chat(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini AI is not initialized. Check GEMINI_API_KEY.');
    }

    const model = systemInstruction
      ? this.genAI.getGenerativeModel({
          model: this.chatModelName,
          systemInstruction,
        })
      : this.chatModel;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
