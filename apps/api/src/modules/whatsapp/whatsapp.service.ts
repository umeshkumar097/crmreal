import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RealtimeService } from '../../infrastructure/realtime/realtime.service';
import { IWhatsAppProvider } from './interfaces/whatsapp-provider.interface';
import { AI_PROVIDER_TOKEN, IAiProvider } from '../../providers/ai/ai.interface';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    @Inject('WHATSAPP_PROVIDER') private readonly provider: any,
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: any,
  ) {}

  // ─── WhatsApp Session CRUD ───────────────────────────────────────────

  async createSession(tenantId: string, userId: string, sessionName: string) {
    const session = await this.prisma.whatsAppSession.create({
      data: {
        tenantId,
        userId,
        sessionName,
        status: 'PAIRING',
        qrStatus: 'PENDING',
      },
    });

    try {
      const initResult = await this.provider.createSession(tenantId, session.id, sessionName);
      const updated = await this.prisma.whatsAppSession.update({
        where: { tenantId_id: { tenantId, id: session.id } },
        data: {
          qrCode: initResult.qrCode || null,
          status: initResult.status,
        },
      });

      // Emit real-time QR event
      this.realtime.emitToTenant(tenantId, 'whatsapp.qr.updated', {
        sessionId: session.id,
        qrCode: initResult.qrCode,
        status: initResult.status,
      });

      return updated;
    } catch (e: any) {
      await this.prisma.whatsAppSession.delete({
        where: { tenantId_id: { tenantId, id: session.id } },
      });
      throw e;
    }
  }

  async getSessionQr(tenantId: string, id: string) {
    const session = await this.prisma.whatsAppSession.findUnique({
      where: { tenantId_id: { tenantId, id } },
    });
    if (!session) throw new NotFoundException('Session not found');

    const result = await this.provider.getSessionQr(tenantId, id);
    if (result.qrCode) {
      await this.prisma.whatsAppSession.update({
        where: { tenantId_id: { tenantId, id } },
        data: { qrCode: result.qrCode },
      });
    }
    return result;
  }

  async getSessionStatus(tenantId: string, id: string) {
    const session = await this.prisma.whatsAppSession.findUnique({
      where: { tenantId_id: { tenantId, id } },
    });
    if (!session) throw new NotFoundException('Session not found');

    const statusInfo = await this.provider.getSessionStatus(tenantId, id);
    const updated = await this.prisma.whatsAppSession.update({
      where: { tenantId_id: { tenantId, id } },
      data: {
        status: statusInfo.status,
        phoneNumber: statusInfo.phoneNumber || session.phoneNumber,
        displayName: statusInfo.displayName || session.displayName,
        profilePic: statusInfo.profilePic || session.profilePic,
        deviceModel: statusInfo.deviceModel || session.deviceModel,
        connectedAt: statusInfo.status === 'CONNECTED' ? new Date() : session.connectedAt,
        lastActivity: new Date(),
      },
    });

    // Emit real-time status event
    this.realtime.emitToTenant(tenantId, 'whatsapp.status.updated', {
      sessionId: id,
      status: statusInfo.status,
      displayName: statusInfo.displayName,
      phoneNumber: statusInfo.phoneNumber,
    });

    return updated;
  }

  async disconnectSession(tenantId: string, id: string) {
    const session = await this.prisma.whatsAppSession.findUnique({
      where: { tenantId_id: { tenantId, id } },
    });
    if (!session) throw new NotFoundException('Session not found');

    await this.provider.disconnectSession(tenantId, id);
    const updated = await this.prisma.whatsAppSession.update({
      where: { tenantId_id: { tenantId, id } },
      data: { status: 'DISCONNECTED', qrStatus: 'EXPIRED', qrCode: null },
    });

    this.realtime.emitToTenant(tenantId, 'whatsapp.status.updated', {
      sessionId: id,
      status: 'DISCONNECTED',
    });

    return updated;
  }

  async deleteSession(tenantId: string, id: string) {
    const session = await this.prisma.whatsAppSession.findUnique({
      where: { tenantId_id: { tenantId, id } },
    });
    if (!session) throw new NotFoundException('Session not found');

    await this.provider.deleteSession(tenantId, id);
    return this.prisma.whatsAppSession.delete({
      where: { tenantId_id: { tenantId, id } },
    });
  }

  async getSessions(tenantId: string) {
    return this.prisma.whatsAppSession.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Messaging Inbox & Timeline ──────────────────────────────────────

  async getConversations(tenantId: string, query: { page?: number; limit?: number }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 30);

    const messages = await this.prisma.whatsAppMessage.findMany({
      where: { tenantId },
      orderBy: { sentAt: 'desc' },
      include: { lead: { select: { id: true, firstName: true, lastName: true, phone: true } } },
    });

    // Group messages into chats by remote number
    const convMap = new Map<string, { phone: string; lead: any; lastBody: string; lastAt: Date; unread: number; messages: any[] }>();
    for (const msg of messages) {
      const phone = msg.direction === 'INBOUND' ? msg.from : msg.to;
      const cleanPhone = phone.split('@')[0];
      if (!convMap.has(cleanPhone)) {
        convMap.set(cleanPhone, {
          phone: cleanPhone,
          lead: msg.lead,
          lastBody: msg.body ?? '',
          lastAt: msg.sentAt,
          unread: 0,
          messages: [],
        });
      }
      const conv = convMap.get(cleanPhone)!;
      conv.messages.push(msg);
      if (msg.direction === 'INBOUND' && msg.status !== 'read') {
        conv.unread++;
      }
    }

    const conversations = Array.from(convMap.values())
      .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
      .slice((page - 1) * limit, page * limit);

    return {
      data: conversations,
      meta: { total: convMap.size, page, limit, totalPages: Math.ceil(convMap.size / limit) },
    };
  }

  async getMessages(tenantId: string, phone: string) {
    const messages = await this.prisma.whatsAppMessage.findMany({
      where: {
        tenantId,
        OR: [
          { from: { contains: phone } },
          { to: { contains: phone } },
        ],
      },
      orderBy: { sentAt: 'asc' },
      include: { lead: true },
    });
    return messages;
  }

  async sendMessage(tenantId: string, userId: string, dto: { to: string; message: string; leadId?: string; sessionId?: string }) {
    // Find active connection session for sending
    let sessId = dto.sessionId;
    if (!sessId) {
      const activeSess = await this.prisma.whatsAppSession.findFirst({
        where: { tenantId, status: 'CONNECTED' },
      });
      if (!activeSess) throw new Error('No active connected WhatsApp session');
      sessId = activeSess.id;
    }

    const providerResult = await this.provider.sendMessage(tenantId, sessId, dto.to, dto.message);

    const msg = await this.prisma.whatsAppMessage.create({
      data: {
        tenantId,
        leadId: dto.leadId ?? null,
        direction: 'OUTBOUND',
        from: 'system',
        to: dto.to,
        body: dto.message,
        type: 'text',
        providerMsgId: providerResult.messageId,
        status: 'sent',
        sentAt: new Date(),
      },
    });

    this.realtime.emitToTenant(tenantId, 'whatsapp.message.sent', {
      phone: dto.to.split('@')[0],
      message: msg,
    });

    return { message: 'Message sent', data: msg };
  }

  async sendMedia(tenantId: string, userId: string, dto: { to: string; mediaUrl: string; type: 'image' | 'document' | 'audio'; caption?: string; fileName?: string; leadId?: string; sessionId?: string }) {
    let sessId = dto.sessionId;
    if (!sessId) {
      const activeSess = await this.prisma.whatsAppSession.findFirst({
        where: { tenantId, status: 'CONNECTED' },
      });
      if (!activeSess) throw new Error('No active connected WhatsApp session');
      sessId = activeSess.id;
    }

    if (typeof this.provider.sendMedia !== 'function') {
      throw new Error('Active provider does not support media sending');
    }

    const providerResult = await this.provider.sendMedia(tenantId, sessId, dto.to, dto.mediaUrl, dto.type, dto.caption, dto.fileName);

    const msg = await this.prisma.whatsAppMessage.create({
      data: {
        tenantId,
        leadId: dto.leadId ?? null,
        direction: 'OUTBOUND',
        from: 'system',
        to: dto.to,
        body: dto.caption || `${dto.type} file`,
        type: dto.type,
        mediaUrl: dto.mediaUrl,
        providerMsgId: providerResult.messageId,
        status: 'sent',
        sentAt: new Date(),
      },
    });

    this.realtime.emitToTenant(tenantId, 'whatsapp.message.sent', {
      phone: dto.to.split('@')[0],
      message: msg,
    });

    return { message: 'Media sent', data: msg };
  }

  async getStats(tenantId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, sentToday, delivered, read] = await Promise.all([
      this.prisma.whatsAppMessage.count({ where: { tenantId } }),
      this.prisma.whatsAppMessage.count({ where: { tenantId, direction: 'OUTBOUND', sentAt: { gte: today } } }),
      this.prisma.whatsAppMessage.count({ where: { tenantId, direction: 'OUTBOUND', deliveredAt: { not: null } } }),
      this.prisma.whatsAppMessage.count({ where: { tenantId, direction: 'OUTBOUND', readAt: { not: null } } }),
    ]);
    const outbound = await this.prisma.whatsAppMessage.count({ where: { tenantId, direction: 'OUTBOUND' } });
    return { total, sentToday, delivered, read, readRate: outbound > 0 ? ((read / outbound) * 100).toFixed(1) + '%' : '0%' };
  }

  async inboundWebhook(tenantId: string, dto: { from: string; message: string; providerMsgId: string; leadId?: string }) {
    let leadId = dto.leadId;
    if (!leadId) {
      const cleanFrom = dto.from.split('@')[0];
      const lead = await this.prisma.lead.findFirst({
        where: { tenantId, phone: { contains: cleanFrom } },
      });
      if (lead) leadId = lead.id;
    }

    const msg = await this.prisma.whatsAppMessage.create({
      data: {
        tenantId,
        leadId: leadId || null,
        direction: 'INBOUND',
        from: dto.from,
        to: 'system',
        body: dto.message,
        type: 'text',
        providerMsgId: dto.providerMsgId,
        status: 'delivered',
        sentAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    this.realtime.emitToTenant(tenantId, 'whatsapp.message.received', {
      phone: dto.from.split('@')[0],
      message: msg,
    });

    return msg;
  }

  // ─── AI Suggestions & Support Helpers ─────────────────────────────────

  async getAiReplySuggestion(tenantId: string, phone: string) {
    const messages = await this.getMessages(tenantId, phone);
    const recentMessages = messages.slice(-8); // Get last 8 messages context
    
    // Find associated lead context if any
    const lead = await this.prisma.lead.findFirst({
      where: { tenantId, phone: { contains: phone } },
      include: { assignedTo: { select: { firstName: true, lastName: true } } },
    });

    const contextStr = recentMessages.map(m => `${m.direction === 'INBOUND' ? 'Lead' : 'Agent'}: ${m.body}`).join('\n');
    const leadDetails = lead ? `Lead Name: ${lead.firstName} ${lead.lastName}, Budget: ₹${lead.budgetMin || 'N/A'}-₹${lead.budgetMax || 'N/A'}, Priority: ${lead.priority}, Stage: ${lead.stage}` : 'No details available';

    const systemPrompt = `You are an AI assistant of a luxury real estate agency. Suggest a professional, friendly, and concise response to the customer. Max 2-3 sentences. Do not use placeholders.
Lead details:
${leadDetails}
Recent Conversation:
${contextStr}`;

    const res = await this.aiProvider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Suggest the next reply.' },
    ]);

    return { suggestion: res.content };
  }

  async assignConversationAgent(tenantId: string, phone: string, agentId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { tenantId, phone: { contains: phone } },
    });
    if (!lead) throw new NotFoundException('No associated lead found for this conversation');

    const updated = await this.prisma.lead.update({
      where: { id: lead.id },
      data: { assignedToId: agentId },
    });

    // Log Activity
    await this.prisma.activityTimeline.create({
      data: {
        tenantId,
        userId: updated.assignedToId || '',
        type: 'SYSTEM',
        title: 'Conversation Reassigned',
        entityType: 'LEAD',
        entityId: lead.id,
        description: 'WhatsApp conversation reassigned to another agent.',
      },
    });

    return updated;
  }

  async addInternalNote(tenantId: string, phone: string, userId: string, note: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { tenantId, phone: { contains: phone } },
    });
    if (!lead) throw new NotFoundException('No associated lead found for this conversation');

    return this.prisma.activityTimeline.create({
      data: {
        tenantId,
        userId,
        type: 'NOTE',
        title: 'Internal Note (WhatsApp)',
        entityType: 'LEAD',
        entityId: lead.id,
        description: note,
      },
    });
  }
}
