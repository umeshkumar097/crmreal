export interface WhatsAppSendTextResult {
  messageId: string;
}

export interface WhatsAppSendTemplateResult {
  messageId: string;
}

export interface WhatsAppSendMediaResult {
  messageId: string;
}

export interface WhatsAppTemplateParam {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename?: string };
  video?: { link: string };
}

export type WhatsAppMediaType = 'image' | 'document' | 'audio' | 'video' | 'sticker';

export interface IWhatsAppProvider {
  /**
   * Send a plain text message
   * @param to - Recipient phone number in E.164 format (e.g., 919876543210)
   * @param body - Message text
   */
  sendText(to: string, body: string): Promise<WhatsAppSendTextResult>;

  /**
   * Send a pre-approved template message
   * @param to - Recipient phone number in E.164 format
   * @param templateName - Approved template name
   * @param params - Component parameters for the template
   * @param language - Template language code (default: 'en_US')
   */
  sendTemplate(
    to: string,
    templateName: string,
    params: WhatsAppTemplateParam[],
    language?: string,
  ): Promise<WhatsAppSendTemplateResult>;

  /**
   * Send a media message (image, document, audio, video)
   * @param to - Recipient phone number in E.164 format
   * @param mediaUrl - Public URL of the media file
   * @param type - Type of media
   * @param caption - Optional caption text
   */
  sendMedia(
    to: string,
    mediaUrl: string,
    type: WhatsAppMediaType,
    caption?: string,
  ): Promise<WhatsAppSendMediaResult>;

  /**
   * Verify webhook token during WhatsApp webhook setup
   * @param token - Token sent by WhatsApp
   * @param challenge - Challenge string to echo back
   * @returns Challenge string if token matches, null otherwise
   */
  verifyWebhook(token: string, challenge: string): string | null;
}

export const WHATSAPP_PROVIDER_TOKEN = 'WHATSAPP_PROVIDER_TOKEN';
