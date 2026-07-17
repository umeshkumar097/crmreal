import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AI_PROVIDER_TOKEN, IAiProvider } from './ai.interface';
import { OpenAiProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AI_PROVIDER_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): IAiProvider => {
        const provider = configService.get<string>('AI_PROVIDER', 'openai');

        switch (provider) {
          case 'gemini':
            return new GeminiProvider(configService);
          case 'openai':
          default:
            return new OpenAiProvider(configService);
        }
      },
    },
    OpenAiProvider,
    GeminiProvider,
  ],
  exports: [AI_PROVIDER_TOKEN, OpenAiProvider, GeminiProvider],
})
export class AiModule {}
