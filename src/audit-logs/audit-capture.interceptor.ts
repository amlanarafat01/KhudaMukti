import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { from, mergeMap, Observable, switchMap } from 'rxjs';
import { AuditLogsService } from './audit-logs.service.js';

@Injectable()
export class AuditCaptureInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditCaptureInterceptor.name);

  constructor(private readonly auditLogs: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id?: number } }>();
    const method = request.method.toUpperCase();
    const parts = request.path.split('/').filter(Boolean);
    const index = parts.findIndex((part) =>
      ['listings', 'claims'].includes(part),
    );
    if (index < 0 || !['POST', 'PATCH', 'PUT', 'DELETE'].includes(method))
      return next.handle();

    const entity = parts[index] === 'listings' ? 'food_listings' : 'claims';
    const action =
      method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
    const entityId = parts[index + 1] ?? null;
    const before = entityId
      ? this.auditLogs.snapshot(entity, entityId).catch(() => null)
      : Promise.resolve(null);

    return from(before).pipe(
      switchMap((oldValue) =>
        next.handle().pipe(
          mergeMap(async (response) => {
            try {
              const responseId =
                response && typeof response === 'object' && 'id' in response
                  ? String((response as { id: unknown }).id)
                  : null;
              await this.auditLogs.record({
                userId:
                  request.user?.id == null ? null : String(request.user.id),
                action,
                entity,
                entityId: entityId ?? responseId,
                oldValue,
                newValue:
                  action === 'DELETE'
                    ? null
                    : ((response ?? request.body) as object),
                ip: request.ip ?? null,
              });
            } catch (error) {
              this.logger.error(
                `Could not persist ${action} audit record for ${entity}: ${error instanceof Error ? error.message : 'unknown error'}`,
              );
            }
            return response;
          }),
        ),
      ),
    );
  }
}
