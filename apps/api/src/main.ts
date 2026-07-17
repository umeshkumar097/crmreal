import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
    .split(',');

  // ─── Security ─────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(compression());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
  });

  // ─── API Versioning ───────────────────────────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  // ─── Global Pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global Filters & Interceptors ────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ─── Swagger (OpenAPI) ────────────────────────────────────────────────────
  if (nodeEnv !== 'production' || configService.get('SWAGGER_ENABLED') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('AI Real Estate CRM API')
      .setDescription(
        'Enterprise-grade multi-tenant Real Estate CRM & ERP — Complete API Documentation',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('Auth', 'Authentication & Authorization')
      .addTag('Users', 'User management')
      .addTag('Dashboard', 'Dashboard statistics')
      .addTag('Leads', 'Lead management')
      .addTag('Properties', 'Property & project management')
      .addTag('Inventory', 'Unit & inventory management')
      .addTag('Customers', 'Customer management')
      .addTag('Bookings', 'Booking management')
      .addTag('Payments', 'Payment tracking')
      .addTag('Collections', 'Collection management')
      .addTag('Documents', 'Document management')
      .addTag('Follow-ups', 'Follow-up management')
      .addTag('Tasks', 'Task management')
      .addTag('WhatsApp', 'WhatsApp integration')
      .addTag('AI', 'AI Copilot & Voice Agent')
      .addTag('Reports', 'Analytics & Reports')
      .addTag('Channel Partners', 'Channel partner management')
      .addTag('Builders', 'Builder management')
      .addTag('HR', 'HR & Commission management')
      .addTag('Marketing', 'Marketing campaigns')
      .addTag('Settings', 'Tenant settings')
      .addTag('Notifications', 'Notification management')
      .addTag('Audit Logs', 'Audit trail')
      .addTag('Feature Flags', 'Feature flag management')
      .addServer(`http://localhost:${port}`, 'Local Development')
      .build();

    const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });

    console.log(`📚 Swagger docs available at: http://localhost:${port}/${swaggerPath}`);
  }

  await app.listen(port);
  console.log(`🚀 API running on: http://localhost:${port}`);
  console.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
