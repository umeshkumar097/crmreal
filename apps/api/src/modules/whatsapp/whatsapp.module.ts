import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { RealtimeModule } from '../../infrastructure/realtime/realtime.module';
import { EvolutionProvider } from './providers/evolution.provider';
import { BaileysProvider } from './providers/baileys.provider';
import { MetaCloudProvider } from './providers/meta-cloud.provider';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    EvolutionProvider,
    BaileysProvider,
    MetaCloudProvider,
    {
      provide: 'WHATSAPP_PROVIDER',
      useFactory: (
        evolution: EvolutionProvider,
        baileys: BaileysProvider,
        meta: MetaCloudProvider,
      ) => {
        const providerName = process.env.WHATSAPP_PROVIDER || 'evolution';
        if (providerName === 'baileys') return baileys;
        if (providerName === 'meta') return meta;
        return evolution;
      },
      inject: [EvolutionProvider, BaileysProvider, MetaCloudProvider],
    },
  ],
  exports: [WhatsappService, 'WHATSAPP_PROVIDER'],
})
export class WhatsappCrmModule {}
