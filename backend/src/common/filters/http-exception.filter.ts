import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ExtendedRequest } from '../middleware/request-id.middleware';
import { ApiResponse } from '@al-husseiniya/types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<ExtendedRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal error occurred';
    let fieldErrors: Record<string, string[]> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        code = exception.name.replace('Exception', '').toUpperCase();
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as any;
        code = obj.code || obj.error || exception.name.replace('Exception', '').toUpperCase();
        message = obj.message || exception.message;

        if (Array.isArray(obj.message)) {
          // Class validator error messages format
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
          fieldErrors = {};
          obj.message.forEach((msg: string) => {
            const field = msg.split(' ')[0] || 'general';
            if (!fieldErrors![field]) fieldErrors![field] = [];
            fieldErrors![field].push(msg);
          });
        }
      }
    } else if (exception instanceof Error) {
      // In development, log the full error
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
        request.requestId,
      );
      // In non-dev, keep message safe
      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
      }
    }

    const payload: ApiResponse<never> = {
      success: false,
      error: {
        code,
        message,
        fieldErrors,
        requestId: request.requestId,
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(payload);
  }
}
