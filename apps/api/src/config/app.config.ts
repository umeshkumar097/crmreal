import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3001',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim()),
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
  swaggerPath: process.env.SWAGGER_PATH ?? 'api/docs',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
  allowedFileTypes: (
    process.env.ALLOWED_FILE_TYPES ??
    'image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    .split(',')
    .map((t) => t.trim()),
}));
