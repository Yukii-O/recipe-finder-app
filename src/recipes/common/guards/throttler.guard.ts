import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createHash } from 'crypto';

@Injectable()
export class DoubleLayerThrottlerGuard extends ThrottlerGuard {
  protected generateKey(
    context: ExecutionContext,
    tracker: string,
    name: string,
  ): string {
    const controllerName = context.getClass().name;

    const rawKey = `${name}-${controllerName}-${tracker}`;
    //padrao do nest para deixar mais leve o reawkey
    return createHash('sha256').update(rawKey).digest('hex');
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id;
  }
}
