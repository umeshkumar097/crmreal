import { Injectable } from '@nestjs/common';
import { RealtimeGateway, REALTIME_EVENTS } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  emitToTenant(tenantId: string, event: string, data: unknown): void {
    this.gateway.emitToTenant(tenantId, event, data);
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.gateway.emitToUser(userId, event, data);
  }

  emitLeadCreated(tenantId: string, lead: unknown): void {
    this.gateway.emitToTenant(tenantId, REALTIME_EVENTS.LEAD_CREATED, lead);
  }

  emitLeadUpdated(tenantId: string, lead: unknown): void {
    this.gateway.emitToTenant(tenantId, REALTIME_EVENTS.LEAD_UPDATED, lead);
  }

  emitLeadAssigned(tenantId: string, assigneeUserId: string, lead: unknown): void {
    this.gateway.emitToTenant(tenantId, REALTIME_EVENTS.LEAD_ASSIGNED, lead);
    this.gateway.emitToUser(assigneeUserId, REALTIME_EVENTS.LEAD_ASSIGNED, lead);
  }

  emitBookingCreated(tenantId: string, booking: unknown): void {
    this.gateway.emitToTenant(tenantId, REALTIME_EVENTS.BOOKING_CREATED, booking);
  }

  emitPaymentReceived(tenantId: string, payment: unknown): void {
    this.gateway.emitToTenant(tenantId, REALTIME_EVENTS.PAYMENT_RECEIVED, payment);
  }

  emitNotification(userId: string, notification: unknown): void {
    this.gateway.emitToUser(userId, REALTIME_EVENTS.NOTIFICATION_NEW, notification);
  }

  emitUnitStatusChanged(tenantId: string, unit: unknown): void {
    this.gateway.emitToTenant(tenantId, REALTIME_EVENTS.UNIT_STATUS_CHANGED, unit);
  }

  emitTaskAssigned(userId: string, task: unknown): void {
    this.gateway.emitToUser(userId, REALTIME_EVENTS.TASK_ASSIGNED, task);
  }

  emitFollowUpDue(userId: string, followUp: unknown): void {
    this.gateway.emitToUser(userId, REALTIME_EVENTS.FOLLOW_UP_DUE, followUp);
  }
}
