import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@al-husseiniya/types';
import { ExtendedRequest } from '../middleware/request-id.middleware';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest<ExtendedRequest>();

    return next.handle().pipe(
      map((res) => {
        // If response already formatted with ApiResponse structure, return directly
        if (res && typeof res === 'object' && 'success' in res) {
          return res;
        }

        // If response has { items, meta } pagination structure
        if (res && typeof res === 'object' && 'items' in res && 'meta' in res) {
          return {
            success: true,
            data: res.items,
            meta: {
              ...res.meta,
              requestId: req?.requestId,
            },
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: res,
          meta: {
            requestId: req?.requestId,
          },
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
