import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '../../common/enums/auth-provider.enum';
import { AppSource } from '../../common/enums/app-source.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', 'google_client_id_placeholder'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', 'google_client_secret_placeholder'),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3000/api/v1/auth/google/callback',
      ),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const state = req.query?.state ? JSON.parse(req.query.state) : {};
    const appSource = state.appSource || AppSource.CONSUMER_APP;

    const email = profile.emails?.[0]?.value;
    const emailVerified = profile.emails?.[0]?.verified === true || true;

    const result = await this.authService.validateOAuthUser(
      {
        provider: AuthProvider.GOOGLE,
        provider_user_id: profile.id,
        email: email || undefined,
        email_verified: emailVerified,
        display_name:
          profile.displayName ||
          `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() ||
          'Usuario Google',
        raw_profile: profile._json,
      },
      appSource,
      {
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'GoogleOAuth',
      },
    );

    done(null, result);
  }
}
