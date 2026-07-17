import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER ?? 'r2',
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    bucketName: process.env.R2_BUCKET_NAME ?? '',
    publicUrl: process.env.R2_PUBLIC_URL ?? '',
    endpoint: process.env.R2_ENDPOINT ?? '',
  },
  s3: {
    region: process.env.S3_REGION ?? 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    bucketName: process.env.S3_BUCKET_NAME ?? '',
    publicUrl: process.env.S3_PUBLIC_URL ?? '',
  },
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING ?? '',
    containerName: process.env.AZURE_CONTAINER_NAME ?? '',
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME ?? '',
    publicUrl: process.env.AZURE_PUBLIC_URL ?? '',
  },
}));
