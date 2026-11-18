// SHARED (Member 4 owns the real interceptor). Wraps results in { success, message, data, meta }.
// A handler that returns { data, meta } gets the meta lifted to the top level.
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          return { success: true, message: 'OK', data: result.data, meta: result.meta };
        }
        return { success: true, message: 'OK', data: result ?? null };
      }),
    );
  }
}
