import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Content,
} from '@google/generative-ai';
import { IAiProvider, AiMessage, AiChatOptions, AiChatResponse } from './ai.interface';

@Injectable()
export class GeminiProvider implements IAiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: string;
  private readonly embeddingModel: string;
  private readonly chatModel: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-1.5-pro');
    this.embeddingModel = this.configService.get<string>(
      'GEMINI_EMBEDDING_MODEL',
      'text-embedding-004',
    );

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.chatModel = this.genAI.getGenerativeModel({ model: this.model });
  }

  async chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse> {
    this.logger.debug(`Gemini chat request: model=${this.model}, messages=${messages.length}`);

    const systemInstruction = options?.systemPrompt;
    const modelInstance = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens,
        topP: options?.topP,
      },
    });

    const history: Content[] = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const chat = modelInstance.startChat({ history });

    const result = await chat.sendMessage(lastMessage?.content ?? '');
    const response = result.response;
    const content = response.text();
    const usageMetadata = response.usageMetadata;

    return {
      content,
      model: this.model,
      finishReason: response.candidates?.[0]?.finishReason ?? 'STOP',
      usage: {
        promptTokens: usageMetadata?.promptTokenCount ?? 0,
        completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }

  async embed(text: string): Promise<number[]> {
    this.logger.debug(`Gemini embed request: text length=${text.length}`);

    const embeddingModel = this.genAI.getGenerativeModel({ model: this.embeddingModel });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  }

  async scoreLead(
    description: string,
  ): Promise<{ score: number; reasoning: string; priority: 'high' | 'medium' | 'low' }> {
    const systemPrompt = `You are an AI assistant specialized in real estate CRM lead scoring.
    Analyze the provided lead description and score it from 0-100 based on buying intent, urgency, budget signals, and engagement level.
    Respond ONLY with a valid JSON object: {"score": number, "reasoning": string, "priority": "high" | "medium" | "low"}`;

    const response = await this.chat(
      [{ role: 'user', content: `Score this real estate lead:\n\n${description}` }],
      { systemPrompt, temperature: 0.3, maxTokens: 500 },
    );

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      const parsed = JSON.parse(jsonMatch[0]) as {
        score: number;
        reasoning: string;
        priority: 'high' | 'medium' | 'low';
      };
      return parsed;
    } catch {
      this.logger.error(`Failed to parse lead score response: ${response.content}`);
      return { score: 50, reasoning: 'Unable to parse AI response', priority: 'medium' };
    }
  }
}
