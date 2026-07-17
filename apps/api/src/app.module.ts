import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import * as Joi from 'joi';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { TenantMiddleware } from './common/middleware/tenant-resolver.middleware';

import { PrismaModule } from './infrastructure/database/prisma.module';
import { RedisModule } from './infrastructure/cache/redis.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { RealtimeModule } from './infrastructure/realtime/realtime.module';
import { StorageModule } from './providers/storage/storage.module';
import { AiModule } from './providers/ai/ai.module';
import { WhatsAppModule } from './providers/messaging/whatsapp/whatsapp.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomersModule } from './modules/customers/customers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ChannelPartnersModule } from './modules/channel-partners/channel-partners.module';
import { BuildersModule } from './modules/builders/builders.module';
import { HrModule } from './modules/hr/hr.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ActivityTimelineModule } from './modules/activity-timeline/activity-timeline.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { HealthModule } from './modules/health/health.module';
import { WhatsappCrmModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, storageConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        STORAGE_PROVIDER: Joi.string().valid('r2', 's3', 'azure').default('r2'),
        AI_PROVIDER: Joi.string().valid('openai', 'gemini').default('openai'),
        WHATSAPP_PROVIDER: Joi.string().valid('meta', 'gupshup', 'twilio', 'baileys', 'evolution').default('meta'),
        THROTTLE_TTL: Joi.number().default(60),
        THROTTLE_LIMIT: Joi.number().default(100),
      }),
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10) * 1000,
          limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
        },
      ],
    }),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.', global: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    QueueModule,
    RealtimeModule,
    StorageModule,
    AiModule,
    WhatsAppModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    DashboardModule,
    LeadsModule,
    PropertiesModule,
    InventoryModule,
    CustomersModule,
    BookingsModule,
    PaymentsModule,
    CollectionsModule,
    DocumentsModule,
    FollowUpsModule,
    TasksModule,
    NotificationsModule,
    ReportsModule,
    ChannelPartnersModule,
    BuildersModule,
    HrModule,
    MarketingModule,
    SettingsModule,
    AuditLogsModule,
    ActivityTimelineModule,
    FeatureFlagsModule,
    HealthModule,
    WhatsappCrmModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
