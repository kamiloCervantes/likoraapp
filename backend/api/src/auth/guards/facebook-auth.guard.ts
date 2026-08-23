import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  override getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const appSource = request.query?.appSource || 'CONSUMER_APP';
    return {
      state: JSON.stringify({ appSource }),
    };
  }
}
