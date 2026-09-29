import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExtendedRequest } from '../middleware/request-id.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<ExtendedRequest>();
    const { method, url } = req;
    const requestId = req.requestId || 'no-id';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const statusCode = res.statusCode;
          const duration = Date.now() - now;
          this.logger.log(
            `[${requestId}] ${method} ${url} ${statusCode} - ${duration}ms`,
          );
        },
        error: (err) => {
          const duration = Date.now() - now;
          const statusCode = err.status || 500;
          this.logger.warn(
            `[${requestId}] ${method} ${url} ${statusCode} - ${duration}ms | ${err.message}`,
          );
        },
      }),
    );
  }
}
