export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiChatOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiChatResponse {
  content: string;
  usage: AiUsage;
  model: string;
  finishReason: string;
}

export interface IAiProvider {
  /**
   * Send a chat completion request
   * @param messages - Array of messages forming the conversation
   * @param options - Optional model parameters
   */
  chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiChatResponse>;

  /**
   * Generate vector embeddings for text
   * @param text - Input text to embed
   * @returns Array of floating point numbers representing the embedding
   */
  embed(text: string): Promise<number[]>;

  /**
   * Score a lead based on their description and interaction history
   * Analyzes the description and returns a score from 0-100
   * @param description - Lead description or interaction summary
   */
  scoreLead(description: string): Promise<{ score: number; reasoning: string; priority: 'high' | 'medium' | 'low' }>;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER_TOKEN';
