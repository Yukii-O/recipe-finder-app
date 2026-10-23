import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { sub: string };
}

export const GetUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user == undefined) {
      throw new UnauthorizedException(
        'o usuário deste token via http é inexistente',
      );
    }
    return request.user.sub;
  },
);
