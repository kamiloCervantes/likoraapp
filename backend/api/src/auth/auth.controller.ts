import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { AppleAuthGuard } from './guards/apple-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.registerLocal(dto, {
      ip: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'LikoraClient',
    });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('El correo electrónico es obligatorio');
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('email') email: string,
    @Body('otp_code') otpCode: string,
    @Body('new_password') newPassword: string,
  ) {
    if (!email || !otpCode || !newPassword) {
      throw new BadRequestException('Correo, código OTP y nueva contraseña son obligatorios');
    }
    return this.authService.resetPassword(email, otpCode, newPassword);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.loginLocal(dto, {
      ip: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'LikoraClient',
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshTokens(dto.refresh_token, {
      ip: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'LikoraClient',
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User, @Req() req: any) {
    const sessionId = req.user?.sessionId;
    return this.authService.logout(user.id, sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user.id);
  }

  @Post('google/token')
  @HttpCode(HttpStatus.OK)
  async googleTokenAuth(
    @Body('id_token') idToken: string,
    @Body('idToken') idTokenAlt: string,
    @Body('app_source') appSource: string,
    @Body('is_registration') isRegistration: boolean,
    @Req() req: Request,
  ) {
    const token = idToken || idTokenAlt;
    return this.authService.authenticateGoogleIdToken(
      token,
      appSource as any,
      {
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'LikoraMobileClient',
      },
      isRegistration === true,
    );
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    this.handleOAuthRedirect(req.user, res, req.query?.state);
  }

  @Post('facebook/token')
  @HttpCode(HttpStatus.OK)
  async facebookTokenAuth(
    @Body('access_token') accessToken: string,
    @Body('accessToken') accessTokenAlt: string,
    @Body('app_source') appSource: string,
    @Body('is_registration') isRegistration: boolean,
    @Req() req: Request,
  ) {
    const token = accessToken || accessTokenAlt;
    return this.authService.authenticateFacebookToken(
      token,
      appSource as any,
      {
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'LikoraMobileClient',
      },
      isRegistration === true,
    );
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(@Req() req: any, @Res() res: Response) {
    this.handleOAuthRedirect(req.user, res, req.query?.state);
  }

  @Post('microsoft/token')
  @HttpCode(HttpStatus.OK)
  async microsoftTokenAuth(
    @Body('access_token') accessToken: string,
    @Body('accessToken') accessTokenAlt: string,
    @Body('app_source') appSource: string,
    @Body('is_registration') isRegistration: boolean,
    @Req() req: Request,
  ) {
    const token = accessToken || accessTokenAlt;
    return this.authService.authenticateMicrosoftToken(
      token,
      appSource as any,
      {
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'LikoraMobileClient',
      },
      isRegistration === true,
    );
  }

  @Get('microsoft')
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuth() {}

  @Get('microsoft/callback')
  @UseGuards(MicrosoftAuthGuard)
  async microsoftCallback(@Req() req: any, @Res() res: Response) {
    this.handleOAuthRedirect(req.user, res, req.query?.state);
  }

  @Post('apple/token')
  @HttpCode(HttpStatus.OK)
  async appleTokenAuth(
    @Body('identity_token') identityToken: string,
    @Body('identityToken') identityTokenAlt: string,
    @Body('full_name') fullName: string,
    @Body('email') email: string,
    @Body('app_source') appSource: string,
    @Body('is_registration') isRegistration: boolean,
    @Req() req: Request,
  ) {
    const token = identityToken || identityTokenAlt;
    return this.authService.authenticateAppleToken(
      token,
      fullName,
      email,
      appSource as any,
      {
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'LikoraMobileClient',
      },
      isRegistration === true,
    );
  }

  @Post('apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleCallback(@Req() req: any, @Res() res: Response) {
    this.handleOAuthRedirect(req.user, res, req.body?.state);
  }

  private handleOAuthRedirect(authResponse: any, res: Response, stateRaw?: any) {
    let appSource = 'CONSUMER_APP';
    try {
      if (stateRaw) {
        const state = typeof stateRaw === 'string' ? JSON.parse(stateRaw) : stateRaw;
        appSource = state.appSource || appSource;
      }
    } catch (e) {}

    const token = authResponse.access_token;
    const refreshToken = authResponse.refresh_token;

    if (appSource === 'ADMIN_WEB') {
      const redirectUrl = `http://localhost:3002/auth/callback?access_token=${token}&refresh_token=${refreshToken}`;
      return res.redirect(redirectUrl);
    }

    const scheme = appSource === 'DRIVER_APP' ? 'likoradriver' : 'likora';
    const deepLink = `${scheme}://oauth/success?access_token=${token}&refresh_token=${refreshToken}`;
    return res.redirect(deepLink);
  }
}
