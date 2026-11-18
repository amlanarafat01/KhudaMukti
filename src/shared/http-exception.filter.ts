// SHARED (Member 4 owns the real filter). One error shape, no stack traces, DB errors -> 4xx.
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : ((body as any).message ?? exception.message);
    } else if (exception instanceof QueryFailedError) {
      const code = (exception as any).driverError?.code;
      if (code === '23505') (status = HttpStatus.CONFLICT), (message = 'Duplicate value violates a unique rule');
      else if (code === '23503') (status = HttpStatus.CONFLICT), (message = 'Related record exists or is missing');
      else if (code === '23514') (status = HttpStatus.BAD_REQUEST), (message = 'Value violates a database rule');
      else this.logger.error(exception.message);
    } else {
      this.logger.error((exception as Error)?.stack ?? String(exception)); // logged, never returned
    }

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
