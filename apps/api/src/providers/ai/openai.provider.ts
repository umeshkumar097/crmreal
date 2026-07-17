import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { IAiProvider, AiMessage, AiChatOptions, AiChatResponse } from './ai.interface';

@Injectable()
export class OpenAiProvider implements IAiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly embeddingModel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o');
    this.embeddingModel = this.configService.get<string>(
      'OPENAI_EMBEDDING_MODEL',
      'text-embedding-3-small',
    );

    this.client = new OpenAI({ apiKey });
  }

  async chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse> {
    const openAiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (options?.systemPrompt) {
      openAiMessages.push({ role: 'system', content: options.systemPrompt });
    }

    for (const msg of messages) {
      openAiMessages.push({ role: msg.role, content: msg.content });
    }

    this.logger.debug(`OpenAI chat request: model=${this.model}, messages=${messages.length}`);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: openAiMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
    });

    const choice = response.choices[0];
    const content = choice?.message?.content ?? '';
    const usage = response.usage;

    return {
      content,
      model: response.model,
      finishReason: choice?.finish_reason ?? 'stop',
      usage: {
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      },
    };
  }

  async embed(text: string): Promise<number[]> {
    this.logger.debug(`OpenAI embed request: model=${this.embeddingModel}, text length=${text.length}`);

    const response = await this.client.embeddings.create({
      model: this.embeddingModel,
      input: text,
      encoding_format: 'float',
    });

    return response.data[0]?.embedding ?? [];
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
      if (!jsonMatch) throw new Error('No JSON found in response');
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
