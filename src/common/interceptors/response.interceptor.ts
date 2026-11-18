import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

function withoutPassword(
  value: unknown,
  seen = new WeakSet<object>(),
): unknown {
  if (Array.isArray(value))
    return value.map((item) => withoutPassword(item, seen));
  if (!value || typeof value !== 'object' || value instanceof Date)
    return value;
  if (seen.has(value)) return null;
  seen.add(value);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !key.toLowerCase().includes('password'))
      .map(([key, item]) => [key, withoutPassword(item, seen)]),
  );
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const startedAt = Date.now();
    return next.handle().pipe(
      map((value: unknown) => {
        if (value && typeof value === 'object' && 'success' in value)
          return withoutPassword(value);
        const page =
          value && typeof value === 'object' && 'items' in value
            ? (value as { items: unknown; meta?: Record<string, unknown> })
            : undefined;
        return {
          success: true,
          message: 'Request successful',
          data: withoutPassword(page ? page.items : value),
          meta: { ...(page?.meta ?? {}), durationMs: Date.now() - startedAt },
        };
      }),
    );
  }
}
