import { Controller, Get, Post, Delete, Param, Body, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('WhatsApp')
@ApiBearerAuth('access-token')
@Controller({ path: 'whatsapp', version: '1' })
@UseGuards(JwtAuthGuard)
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}

  // ─── REST Session Connections ────────────────────────────────────────

  @Post('session/create')
  @ApiOperation({ summary: 'Create a new WhatsApp session / connection' })
  createSession(@Req() req: any, @Body() dto: { sessionName: string }) {
    return this.service.createSession(req.user.tenantId, req.user.userId, dto.sessionName);
  }

  @Get('session/:id/qr')
  @ApiOperation({ summary: 'Get WhatsApp session connection pairing QR code' })
  getSessionQr(@Param('id') id: string, @Req() req: any) {
    return this.service.getSessionQr(req.user.tenantId, id);
  }

  @Get('session/:id/status')
  @ApiOperation({ summary: 'Fetch current WhatsApp session pairing status' })
  getSessionStatus(@Param('id') id: string, @Req() req: any) {
    return this.service.getSessionStatus(req.user.tenantId, id);
  }

  @Post('session/:id/disconnect')
  @ApiOperation({ summary: 'Disconnect/Log out of WhatsApp session device' })
  disconnectSession(@Param('id') id: string, @Req() req: any) {
    return this.service.disconnectSession(req.user.tenantId, id);
  }

  @Delete('session/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove WhatsApp session session details' })
  deleteSession(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteSession(req.user.tenantId, id);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List all WhatsApp sessions for the tenant' })
  getSessions(@Req() req: any) {
    return this.service.getSessions(req.user.tenantId);
  }

  // ─── Messaging Inbox & Helpers ───────────────────────────────────────

  @Get('conversations')
  @ApiOperation({ summary: 'Get list of active conversation threads' })
  getConversations(@Req() req: any, @Query() q: any) {
    return this.service.getConversations(req.user.tenantId, q);
  }

  @Get('messages/:phone')
  @ApiOperation({ summary: 'Get message timeline of a phone conversation' })
  getMessages(@Param('phone') phone: string, @Req() req: any) {
    return this.service.getMessages(req.user.tenantId, phone);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get WhatsApp conversation metrics stats' })
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.tenantId);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send text message outbound' })
  send(@Req() req: any, @Body() dto: { to: string; message: string; leadId?: string; sessionId?: string }) {
    return this.service.sendMessage(req.user.tenantId, req.user.userId, dto);
  }

  @Post('send-media')
  @ApiOperation({ summary: 'Send media message (image/document/audio) outbound' })
  sendMedia(@Req() req: any, @Body() dto: { to: string; mediaUrl: string; type: 'image' | 'document' | 'audio'; caption?: string; fileName?: string; leadId?: string; sessionId?: string }) {
    return this.service.sendMedia(req.user.tenantId, req.user.userId, dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Inbound message callback webhook receiver' })
  webhook(@Req() req: any, @Body() dto: any) {
    return this.service.inboundWebhook(req.user.tenantId, dto);
  }

  @Get('ai-suggest/:phone')
  @ApiOperation({ summary: 'Get suggested next response text from Gemini' })
  aiSuggest(@Param('phone') phone: string, @Req() req: any) {
    return this.service.getAiReplySuggestion(req.user.tenantId, phone);
  }

  @Post('assign/:phone')
  @ApiOperation({ summary: 'Reassign conversation context to agent' })
  assignAgent(@Param('phone') phone: string, @Req() req: any, @Body() dto: { agentId: string }) {
    return this.service.assignConversationAgent(req.user.tenantId, phone, dto.agentId);
  }

  @Post('note/:phone')
  @ApiOperation({ summary: 'Add internal timeline note for conversation' })
  addNote(@Param('phone') phone: string, @Req() req: any, @Body() dto: { note: string }) {
    return this.service.addInternalNote(req.user.tenantId, phone, req.user.userId, dto.note);
  }
}
