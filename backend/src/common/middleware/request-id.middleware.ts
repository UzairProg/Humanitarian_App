import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface ExtendedRequest extends Request {
  requestId?: string;
  user?: any;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: ExtendedRequest, res: Response, next: NextFunction): void {
    const existingId = req.headers['x-request-id'] as string;
    const requestId = existingId || uuidv4();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
