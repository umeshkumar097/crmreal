import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER_TOKEN } from './storage.interface';
import { R2StorageProvider } from './r2.provider';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_PROVIDER_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): R2StorageProvider => {
        const provider = configService.get<string>('storage.provider', 'r2');

        switch (provider) {
          case 'r2':
            return new R2StorageProvider(configService);
          case 's3':
            // S3StorageProvider shares same interface — use R2 with S3 config as fallback
            // until S3StorageProvider is implemented
            return new R2StorageProvider(configService);
          default:
            return new R2StorageProvider(configService);
        }
      },
    },
    StorageService,
  ],
  exports: [STORAGE_PROVIDER_TOKEN, StorageService],
})
export class StorageModule {}
