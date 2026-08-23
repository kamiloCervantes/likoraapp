import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '../../common/enums/auth-provider.enum';
import { AppSource } from '../../common/enums/app-source.enum';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID', 'com.likora.app'),
      teamID: configService.get<string>('APPLE_TEAM_ID', 'APPLE_TEAM_ID_PLACEHOLDER'),
      keyID: configService.get<string>('APPLE_KEY_ID', 'APPLE_KEY_ID_PLACEHOLDER'),
      privateKeyLocation: configService.get<string>('APPLE_PRIVATE_KEY_PATH', '/app/keys/AuthKey_apple.p8'),
      callbackURL: configService.get<string>(
        'APPLE_CALLBACK_URL',
        'https://api.likora.app/api/v1/auth/apple/callback',
      ),
      scope: ['email', 'name'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<any> {
    const userPayload = req.body?.user ? JSON.parse(req.body.user) : {};
    const appSource = req.body?.state ? JSON.parse(req.body.state).appSource : AppSource.CONSUMER_APP;

    const email = idToken?.email || userPayload?.email;
    const nameObj = userPayload?.name;
    const displayName = nameObj
      ? `${nameObj.firstName || ''} ${nameObj.lastName || ''}`.trim()
      : 'Usuario Apple';

    const result = await this.authService.validateOAuthUser(
      {
        provider: AuthProvider.APPLE,
        provider_user_id: idToken?.sub || profile?.id,
        email: email || undefined,
        email_verified: true, // Apple garantiza la autenticidad del email firmado
        display_name: displayName || 'Usuario Apple',
        raw_profile: { idToken, userPayload },
      },
      appSource,
      {
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'AppleOAuth',
      },
    );

    done(null, result);
  }
}
