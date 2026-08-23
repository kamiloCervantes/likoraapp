import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '../../common/enums/auth-provider.enum';
import { AppSource } from '../../common/enums/app-source.enum';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID', 'facebook_app_id_placeholder'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET', 'facebook_app_secret_placeholder'),
      callbackURL: configService.get<string>(
        'FACEBOOK_CALLBACK_URL',
        'http://localhost:3000/api/v1/auth/facebook/callback',
      ),
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'name', 'emails'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any) => void,
  ): Promise<any> {
    const state = req.query?.state ? JSON.parse(req.query.state) : {};
    const appSource = state.appSource || AppSource.CONSUMER_APP;

    const email = profile.emails?.[0]?.value;

    const result = await this.authService.validateOAuthUser(
      {
        provider: AuthProvider.FACEBOOK,
        provider_user_id: profile.id,
        email: email || undefined,
        email_verified: !!email,
        display_name: profile.displayName || 'Usuario Facebook',
        raw_profile: profile._json,
      },
      appSource,
      {
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'FacebookOAuth',
      },
    );

    done(null, result);
  }
}
