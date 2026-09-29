import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { DatabaseModule } from './database/database.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

// Common
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

// Domain Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { RequestsModule } from './modules/requests/requests.module';
import { FoodProgramsModule } from './modules/food-programs/food-programs.module';
import { EventsModule } from './modules/events/events.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    InfrastructureModule,
    AuthModule,
    UsersModule,
    RolesModule,
    OrganizationsModule,
    BusinessesModule,
    RequestsModule,
    FoodProgramsModule,
    EventsModule,
    KnowledgeModule,
    ContributorsModule,
    VolunteersModule,
    ReportsModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
