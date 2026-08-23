import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '../../common/enums/auth-provider.enum';
import { AppSource } from '../../common/enums/app-source.enum';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID', 'microsoft_client_id_placeholder'),
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET', 'microsoft_client_secret_placeholder'),
      callbackURL: configService.get<string>(
        'MICROSOFT_CALLBACK_URL',
        'http://localhost:3000/api/v1/auth/microsoft/callback',
      ),
      scope: ['user.read'],
      tenant: 'common',
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ): Promise<any> {
    const state = req.query?.state ? JSON.parse(req.query.state) : {};
    const appSource = state.appSource || AppSource.CONSUMER_APP;

    const email = profile.emails?.[0]?.value || profile._json?.userPrincipalName || profile._json?.mail;

    const result = await this.authService.validateOAuthUser(
      {
        provider: AuthProvider.MICROSOFT,
        provider_user_id: profile.id,
        email: email || undefined,
        email_verified: !!email,
        display_name: profile.displayName || 'Usuario Microsoft',
        raw_profile: profile._json,
      },
      appSource,
      {
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'MicrosoftOAuth',
      },
    );

    done(null, result);
  }
}
