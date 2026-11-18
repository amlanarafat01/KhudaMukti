import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity.js';
import { AuditLogsController } from './audit-logs.controller.js';
import { AuditLogsService } from './audit-logs.service.js';
import { AuditCaptureInterceptor } from './audit-capture.interceptor.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService,
    { provide: APP_INTERCEPTOR, useClass: AuditCaptureInterceptor },
  ],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
