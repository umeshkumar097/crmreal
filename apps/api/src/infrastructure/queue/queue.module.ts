import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  EMAIL_QUEUE,
  WHATSAPP_QUEUE,
  NOTIFICATION_QUEUE,
  REPORT_QUEUE,
  AI_CALL_QUEUE,
} from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host', 'localhost'),
          port: configService.get<number>('redis.port', 6379),
          password: configService.get<string>('redis.password') || undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: EMAIL_QUEUE },
      { name: WHATSAPP_QUEUE },
      { name: NOTIFICATION_QUEUE },
      { name: REPORT_QUEUE },
      { name: AI_CALL_QUEUE },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
