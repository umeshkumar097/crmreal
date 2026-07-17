import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/types/jwt-payload.type';

export const REALTIME_EVENTS = {
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_ASSIGNED: 'lead.assigned',
  BOOKING_CREATED: 'booking.created',
  PAYMENT_RECEIVED: 'payment.received',
  NOTIFICATION_NEW: 'notification.new',
  UNIT_STATUS_CHANGED: 'unit.status_changed',
  TASK_ASSIGNED: 'task.assigned',
  FOLLOW_UP_DUE: 'follow_up.due',
  DOCUMENT_UPLOADED: 'document.uploaded',
} as const;

export type RealtimeEvent = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

interface AuthenticatedSocket extends Socket {
  user: JwtPayload;
}

@Injectable()
@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'];
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedUsers = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('RealtimeGateway initialized');

    server.use((socket: Socket, next: (err?: Error) => void) => {
      this.authenticateSocket(socket as AuthenticatedSocket, next);
    });
  }

  private authenticateSocket(
    socket: AuthenticatedSocket,
    next: (err?: Error) => void,
  ): void {
    try {
      const token =
        (socket.handshake.auth['token'] as string) ??
        (socket.handshake.headers['authorization'] as string)?.replace('Bearer ', '');

      if (!token) {
        next(new WsException('Authentication token missing'));
        return;
      }

      const secret = this.configService.get<string>('jwt.accessSecret');
      const payload = this.jwtService.verify<JwtPayload>(token, { secret });
      socket.user = payload;
      next();
    } catch {
      next(new WsException('Invalid or expired token'));
    }
  }

  handleConnection(client: AuthenticatedSocket): void {
    const user = client.user;
    this.logger.log(`Client connected: ${client.id} | user=${user.sub} | tenant=${user.tenantId}`);

    void client.join(`tenant:${user.tenantId}`);
    void client.join(`user:${user.sub}`);

    if (!this.connectedUsers.has(user.sub)) {
      this.connectedUsers.set(user.sub, new Set());
    }
    this.connectedUsers.get(user.sub)!.add(client.id);

    client.emit('connected', {
      socketId: client.id,
      userId: user.sub,
      tenantId: user.tenantId,
    });
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const user = client.user;
    if (user) {
      this.logger.log(`Client disconnected: ${client.id} | user=${user.sub}`);
      const sockets = this.connectedUsers.get(user.sub);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.connectedUsers.delete(user.sub);
        }
      }
    }
  }

  @SubscribeMessage('join:tenant')
  handleJoinTenant(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tenantId: string },
  ): void {
    const user = client.user;
    if (data.tenantId !== user.tenantId) {
      throw new WsException('Cannot join another tenant room');
    }
    void client.join(`tenant:${data.tenantId}`);
    this.logger.debug(`${client.id} joined tenant room: ${data.tenantId}`);
    client.emit('joined:tenant', { tenantId: data.tenantId });
  }

  @SubscribeMessage('join:user')
  handleJoinUser(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ): void {
    const user = client.user;
    if (data.userId !== user.sub) {
      throw new WsException('Cannot join another user room');
    }
    void client.join(`user:${data.userId}`);
    this.logger.debug(`${client.id} joined user room: ${data.userId}`);
    client.emit('joined:user', { userId: data.userId });
  }

  emitToTenant(tenantId: string, event: string, data: unknown): void {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
    this.logger.debug(`Emitted '${event}' to tenant ${tenantId}`);
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.debug(`Emitted '${event}' to user ${userId}`);
  }

  getConnectedUserCount(tenantId?: string): number {
    if (!tenantId) return this.connectedUsers.size;
    return Array.from(this.connectedUsers.entries()).filter(([userId]) => {
      const sockets = this.connectedUsers.get(userId);
      return sockets && sockets.size > 0;
    }).length;
  }
}
