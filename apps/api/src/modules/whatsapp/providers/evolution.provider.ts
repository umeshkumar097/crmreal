import { Injectable } from '@nestjs/common';
import { IWhatsAppProvider, WhatsAppSessionStatus } from '../interfaces/whatsapp-provider.interface';
import axios from 'axios';

@Injectable()
export class EvolutionProvider implements IWhatsAppProvider {
  private getApiUrl() {
    return process.env.EVOLUTION_API_URL || 'http://localhost:8080';
  }

  private getApiKey() {
    return process.env.EVOLUTION_API_API_KEY || 'apikey-crm-secret';
  }

  private getHeaders() {
    return {
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.getApiKey(),
      },
    };
  }

  async createSession(tenantId: string, sessionId: string, sessionName: string): Promise<{ qrCode?: string; status: string }> {
    try {
      const url = `${this.getApiUrl()}/instance/create`;
      const body = {
        instanceName: sessionId,
        token: `token-${sessionId}`,
        qrcode: true,
      };
      const res = await axios.post(url, body, this.getHeaders());
      const qrCode = res.data?.qrcode?.base64 || res.data?.qrcode?.code;
      return {
        qrCode,
        status: res.data?.instance?.status === 'open' ? 'CONNECTED' : 'PAIRING',
      };
    } catch (e: any) {
      // If already exists, return current connection state
      if (e.response?.status === 400 || e.response?.data?.message?.includes('exists')) {
        const state = await this.getSessionStatus(tenantId, sessionId);
        return {
          qrCode: state.qrCode,
          status: state.status,
        };
      }
      throw e;
    }
  }

  async getSessionQr(tenantId: string, sessionId: string): Promise<{ qrCode: string }> {
    try {
      const url = `${this.getApiUrl()}/instance/connect/${sessionId}`;
      const res = await axios.get(url, this.getHeaders());
      return { qrCode: res.data?.base64 || res.data?.code || '' };
    } catch (e) {
      return { qrCode: '' };
    }
  }

  async getSessionStatus(tenantId: string, sessionId: string): Promise<WhatsAppSessionStatus> {
    try {
      const url = `${this.getApiUrl()}/instance/connectionState/${sessionId}`;
      const res = await axios.get(url, this.getHeaders());
      const instanceState = res.data?.instance?.state; // open, close, connecting
      const status = instanceState === 'open' ? 'CONNECTED' : instanceState === 'connecting' ? 'PAIRING' : 'DISCONNECTED';

      let phoneNumber = undefined;
      let displayName = undefined;
      let profilePic = undefined;

      if (status === 'CONNECTED') {
        // Fetch instance info for details
        const infoUrl = `${this.getApiUrl()}/instance/fetchInstances?instanceName=${sessionId}`;
        const infoRes = await axios.get(infoUrl, this.getHeaders());
        const inst = Array.isArray(infoRes.data) ? infoRes.data.find((i: any) => i.name === sessionId) : null;
        if (inst) {
          phoneNumber = inst.ownerJid?.split('@')[0];
          displayName = inst.profileName;
          profilePic = inst.profilePictureUrl;
        }
      }

      return {
        status,
        phoneNumber,
        displayName,
        profilePic,
        deviceModel: 'Evolution API Instance',
      };
    } catch (e) {
      return { status: 'DISCONNECTED' };
    }
  }

  async disconnectSession(tenantId: string, sessionId: string): Promise<void> {
    try {
      const url = `${this.getApiUrl()}/instance/logout/${sessionId}`;
      await axios.post(url, {}, this.getHeaders());
    } catch (e) {
      // Ignore if already disconnected
    }
  }

  async deleteSession(tenantId: string, sessionId: string): Promise<void> {
    try {
      const url = `${this.getApiUrl()}/instance/delete/${sessionId}`;
      await axios.delete(url, this.getHeaders());
    } catch (e) {
      // Ignore
    }
  }

  async sendMessage(tenantId: string, sessionId: string, to: string, text: string): Promise<{ messageId: string }> {
    const url = `${this.getApiUrl()}/message/sendText/${sessionId}`;
    const cleanTo = to.includes('@') ? to : `${to.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const body = {
      number: cleanTo,
      options: {
        delay: 1200,
        presence: 'composing',
      },
      textMessage: {
        text: text,
      },
    };
    const res = await axios.post(url, body, this.getHeaders());
    return { messageId: res.data?.key?.id || `msg_${Date.now()}` };
  }

  async sendMedia(tenantId: string, sessionId: string, to: string, mediaUrl: string, type: 'image' | 'document' | 'audio', caption?: string, fileName?: string): Promise<{ messageId: string }> {
    const url = `${this.getApiUrl()}/message/sendMedia/${sessionId}`;
    const cleanTo = to.includes('@') ? to : `${to.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const body = {
      number: cleanTo,
      options: {
        delay: 1200,
      },
      mediaMessage: {
        mediatype: type === 'image' ? 'image' : type === 'audio' ? 'audio' : 'document',
        media: mediaUrl,
        caption: caption || undefined,
        fileName: fileName || undefined,
      },
    };
    const res = await axios.post(url, body, this.getHeaders());
    return { messageId: res.data?.key?.id || `msg_${Date.now()}` };
  }
}
