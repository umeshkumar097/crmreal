export const QUEUE_NAMES = {
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  NOTIFICATION: 'notification',
  REPORT: 'report',
  AI_CALL: 'ai-call',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const EMAIL_QUEUE = QUEUE_NAMES.EMAIL;
export const WHATSAPP_QUEUE = QUEUE_NAMES.WHATSAPP;
export const NOTIFICATION_QUEUE = QUEUE_NAMES.NOTIFICATION;
export const REPORT_QUEUE = QUEUE_NAMES.REPORT;
export const AI_CALL_QUEUE = QUEUE_NAMES.AI_CALL;

export const JOB_NAMES = {
  // Email jobs
  SEND_WELCOME_EMAIL: 'send-welcome-email',
  SEND_PASSWORD_RESET: 'send-password-reset',
  SEND_BOOKING_CONFIRMATION: 'send-booking-confirmation',
  SEND_PAYMENT_RECEIPT: 'send-payment-receipt',
  SEND_FOLLOW_UP_EMAIL: 'send-follow-up-email',
  SEND_BULK_EMAIL: 'send-bulk-email',

  // WhatsApp jobs
  SEND_WHATSAPP_TEXT: 'send-whatsapp-text',
  SEND_WHATSAPP_TEMPLATE: 'send-whatsapp-template',
  SEND_WHATSAPP_MEDIA: 'send-whatsapp-media',
  SEND_WHATSAPP_BULK: 'send-whatsapp-bulk',

  // Notification jobs
  SEND_PUSH_NOTIFICATION: 'send-push-notification',
  SEND_IN_APP_NOTIFICATION: 'send-in-app-notification',

  // Report jobs
  GENERATE_SALES_REPORT: 'generate-sales-report',
  GENERATE_LEAD_REPORT: 'generate-lead-report',
  GENERATE_PAYMENT_REPORT: 'generate-payment-report',
  EXPORT_DATA: 'export-data',

  // AI Call jobs
  AI_LEAD_SCORE: 'ai-lead-score',
  AI_SENTIMENT_ANALYSIS: 'ai-sentiment-analysis',
  AI_FOLLOW_UP_SUGGESTION: 'ai-follow-up-suggestion',
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
