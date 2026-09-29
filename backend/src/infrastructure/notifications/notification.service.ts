import { Injectable, Logger } from '@nestjs/common';
import { maskEmail, maskPhone } from '@al-husseiniya/utils';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SmsOptions {
  to: string;
  message: string;
}

export interface PushOptions {
  userId: string;
  title: string;
  body: string;
  payload?: Record<string, any>;
}

export abstract class EmailService {
  abstract sendEmail(options: EmailOptions): Promise<boolean>;
}

export abstract class SmsService {
  abstract sendSms(options: SmsOptions): Promise<boolean>;
}

export abstract class NotificationService {
  abstract sendPushNotification(options: PushOptions): Promise<boolean>;
}

@Injectable()
export class DevEmailService implements EmailService {
  private readonly logger = new Logger('EmailService:Dev');

  async sendEmail(options: EmailOptions): Promise<boolean> {
    this.logger.log(
      `[DevEmail] Dispatched to: ${maskEmail(options.to)} | Subject: "${options.subject}"`,
    );
    return true;
  }
}

@Injectable()
export class DevSmsService implements SmsService {
  private readonly logger = new Logger('SmsService:Dev');

  async sendSms(options: SmsOptions): Promise<boolean> {
    this.logger.log(
      `[DevSms] Dispatched to: ${maskPhone(options.to)} | Message: "${options.message}"`,
    );
    return true;
  }
}

@Injectable()
export class DevNotificationService implements NotificationService {
  private readonly logger = new Logger('NotificationService:Dev');

  async sendPushNotification(options: PushOptions): Promise<boolean> {
    this.logger.log(
      `[DevPush] Dispatched to user: ${options.userId} | Title: "${options.title}"`,
    );
    return true;
  }
}
