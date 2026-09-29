import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { StorageService, LocalStorageService } from './storage/storage.service';
import { MapService, MockMapService } from './maps/map.service';
import {
  EmailService,
  DevEmailService,
  SmsService,
  DevSmsService,
  NotificationService,
  DevNotificationService,
} from './notifications/notification.service';
import { SearchService, DatabaseSearchService } from './search/search.service';
import { AuditService } from './audit/audit.service';
import { AuditLog, AuditLogSchema } from '../database/schemas/audit-log.schema';
import { AuthorizationService } from '../common/authorization/authorization.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
    ConfigModule,
  ],
  providers: [
    { provide: StorageService, useClass: LocalStorageService },
    { provide: MapService, useClass: MockMapService },
    { provide: EmailService, useClass: DevEmailService },
    { provide: SmsService, useClass: DevSmsService },
    { provide: NotificationService, useClass: DevNotificationService },
    { provide: SearchService, useClass: DatabaseSearchService },
    AuditService,
    AuthorizationService,
  ],
  exports: [
    StorageService,
    MapService,
    EmailService,
    SmsService,
    NotificationService,
    SearchService,
    AuditService,
    AuthorizationService,
  ],
})
export class InfrastructureModule {}
