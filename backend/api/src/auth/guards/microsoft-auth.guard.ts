import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard('microsoft') {
  override getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const appSource = request.query?.appSource || 'CONSUMER_APP';
    return {
      state: JSON.stringify({ appSource }),
    };
  }
}
