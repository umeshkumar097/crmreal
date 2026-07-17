export interface WhatsAppSessionStatus {
  status: 'CONNECTED' | 'DISCONNECTED' | 'PAIRING' | 'EXPIRED';
  phoneNumber?: string;
  displayName?: string;
  profilePic?: string;
  deviceModel?: string;
  qrCode?: string;
}

export interface IWhatsAppProvider {
  createSession(tenantId: string, sessionId: string, sessionName: string): Promise<{ qrCode?: string; status: string }>;
  getSessionQr(tenantId: string, sessionId: string): Promise<{ qrCode: string }>;
  getSessionStatus(tenantId: string, sessionId: string): Promise<WhatsAppSessionStatus>;
  disconnectSession(tenantId: string, sessionId: string): Promise<void>;
  deleteSession(tenantId: string, sessionId: string): Promise<void>;
  
  sendMessage(tenantId: string, sessionId: string, to: string, text: string): Promise<{ messageId: string }>;
  sendMedia?(tenantId: string, sessionId: string, to: string, mediaUrl: string, type: 'image' | 'document' | 'audio', caption?: string, fileName?: string): Promise<{ messageId: string }>;
}
