import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WHATSAPP_PROVIDER_TOKEN, IWhatsAppProvider } from './whatsapp.interface';
import { MetaWhatsAppProvider } from './meta.provider';

@Global()
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    {
      provide: WHATSAPP_PROVIDER_TOKEN,
      inject: [ConfigService, MetaWhatsAppProvider],
      useFactory: (
        configService: ConfigService,
        metaProvider: MetaWhatsAppProvider,
      ): IWhatsAppProvider => {
        const provider = configService.get<string>('WHATSAPP_PROVIDER', 'meta');

        switch (provider) {
          case 'meta':
          default:
            return metaProvider;
        }
      },
    },
    MetaWhatsAppProvider,
  ],
  exports: [WHATSAPP_PROVIDER_TOKEN, MetaWhatsAppProvider],
})
export class WhatsAppModule {}
