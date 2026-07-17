import { Injectable } from '@nestjs/common';
import { IWhatsAppProvider, WhatsAppSessionStatus } from '../interfaces/whatsapp-provider.interface';
import axios from 'axios';

@Injectable()
export class MetaCloudProvider implements IWhatsAppProvider {
  // Meta Cloud API is cloud-hosted and does not use QR pairing/disconnect sessions dynamically
  async createSession(tenantId: string, sessionId: string, sessionName: string): Promise<{ qrCode?: string; status: string }> {
    return { status: 'CONNECTED' };
  }

  async getSessionQr(tenantId: string, sessionId: string): Promise<{ qrCode: string }> {
    return { qrCode: '' };
  }

  async getSessionStatus(tenantId: string, sessionId: string): Promise<WhatsAppSessionStatus> {
    return {
      status: 'CONNECTED',
      phoneNumber: process.env.META_PHONE_NUMBER_ID || 'meta-cloud',
      displayName: 'Meta Cloud API Account',
      deviceModel: 'Meta Cloud Host',
    };
  }

  async disconnectSession(tenantId: string, sessionId: string): Promise<void> {}

  async deleteSession(tenantId: string, sessionId: string): Promise<void> {}

  async sendMessage(tenantId: string, sessionId: string, to: string, text: string): Promise<{ messageId: string }> {
    const phoneId = process.env.META_PHONE_NUMBER_ID;
    const token = process.env.META_ACCESS_TOKEN;
    if (!phoneId || !token) {
      throw new Error('Meta API credentials missing');
    }
    const cleanTo = to.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    const res = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: cleanTo,
        type: 'text',
        text: { body: text },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return { messageId: res.data?.messages?.[0]?.id || `meta_${Date.now()}` };
  }

  async sendMedia(tenantId: string, sessionId: string, to: string, mediaUrl: string, type: 'image' | 'document' | 'audio', caption?: string, fileName?: string): Promise<{ messageId: string }> {
    const phoneId = process.env.META_PHONE_NUMBER_ID;
    const token = process.env.META_ACCESS_TOKEN;
    if (!phoneId || !token) {
      throw new Error('Meta API credentials missing');
    }
    const cleanTo = to.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    
    let mediaObj: any = { link: mediaUrl };
    if (caption && type === 'image') mediaObj.caption = caption;
    if (fileName && type === 'document') mediaObj.filename = fileName;

    const res = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: cleanTo,
        type: type === 'image' ? 'image' : type === 'audio' ? 'audio' : 'document',
        [type === 'image' ? 'image' : type === 'audio' ? 'audio' : 'document']: mediaObj,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return { messageId: res.data?.messages?.[0]?.id || `meta_${Date.now()}` };
  }
}
