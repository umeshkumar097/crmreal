import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  IWhatsAppProvider,
  WhatsAppMediaType,
  WhatsAppSendMediaResult,
  WhatsAppSendTemplateResult,
  WhatsAppSendTextResult,
  WhatsAppTemplateParam,
} from './whatsapp.interface';

interface MetaApiResponse {
  messages?: Array<{ id: string }>;
  error?: { message: string; code: number };
}

@Injectable()
export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);
  private readonly apiVersion = 'v19.0';
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly webhookVerifyToken: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.phoneNumberId = this.configService.getOrThrow<string>('META_PHONE_NUMBER_ID');
    this.accessToken = this.configService.getOrThrow<string>('META_ACCESS_TOKEN');
    this.webhookVerifyToken = this.configService.getOrThrow<string>('META_WEBHOOK_VERIFY_TOKEN');
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  async sendText(to: string, body: string): Promise<WhatsAppSendTextResult> {
    this.logger.log(`Sending text message to ${to}`);

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body },
    };

    const response = await this.sendRequest(payload);
    const messageId = response.messages?.[0]?.id ?? '';

    this.logger.log(`Text message sent to ${to}: messageId=${messageId}`);
    return { messageId };
  }

  async sendTemplate(
    to: string,
    templateName: string,
    params: WhatsAppTemplateParam[],
    language: string = 'en_US',
  ): Promise<WhatsAppSendTemplateResult> {
    this.logger.log(`Sending template '${templateName}' to ${to}`);

    const components =
      params.length > 0
        ? [{ type: 'body', parameters: params }]
        : [];

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components,
      },
    };

    const response = await this.sendRequest(payload);
    const messageId = response.messages?.[0]?.id ?? '';

    this.logger.log(`Template '${templateName}' sent to ${to}: messageId=${messageId}`);
    return { messageId };
  }

  async sendMedia(
    to: string,
    mediaUrl: string,
    type: WhatsAppMediaType,
    caption?: string,
  ): Promise<WhatsAppSendMediaResult> {
    this.logger.log(`Sending ${type} media to ${to}`);

    const mediaObject: Record<string, string> = { link: mediaUrl };
    if (caption && ['image', 'document', 'video'].includes(type)) {
      mediaObject['caption'] = caption;
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
      [type]: mediaObject,
    };

    const response = await this.sendRequest(payload);
    const messageId = response.messages?.[0]?.id ?? '';

    this.logger.log(`${type} media sent to ${to}: messageId=${messageId}`);
    return { messageId };
  }

  verifyWebhook(token: string, challenge: string): string | null {
    if (token === this.webhookVerifyToken) {
      this.logger.log('Webhook verification successful');
      return challenge;
    }
    this.logger.warn('Webhook verification failed: token mismatch');
    return null;
  }

  private async sendRequest(payload: Record<string, unknown>): Promise<MetaApiResponse> {
    const response = await firstValueFrom(
      this.httpService.post<MetaApiResponse>(this.baseUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    );

    if (response.data.error) {
      const err = response.data.error;
      this.logger.error(`Meta API error: ${err.message} (code: ${err.code})`);
      throw new Error(`WhatsApp API error: ${err.message}`);
    }

    return response.data;
  }
}
