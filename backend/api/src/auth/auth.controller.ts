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

  // ----------------------------------------------------
  // GOOGLE OAUTH
  // ----------------------------------------------------
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Redirige a Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    this.handleOAuthRedirect(req.user, res, req.query?.state);
  }

  // ----------------------------------------------------
  // FACEBOOK OAUTH
  // ----------------------------------------------------
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth() {
    // Redirige a Facebook
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(@Req() req: any, @Res() res: Response) {
    this.handleOAuthRedirect(req.user, res, req.query?.state);
  }

  // ----------------------------------------------------
  // MICROSOFT OAUTH
  // ----------------------------------------------------
  @Get('microsoft')
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuth() {
    // Redirige a Microsoft
  }

  @Get('microsoft/callback')
  @UseGuards(MicrosoftAuthGuard)
  async microsoftCallback(@Req() req: any, @Res() res: Response) {
    this.handleOAuthRedirect(req.user, res, req.query?.state);
  }

  // ----------------------------------------------------
  // APPLE OAUTH (POST Form Callback)
  // ----------------------------------------------------
  @Post('apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleCallback(@Req() req: any, @Res() res: Response) {
    this.handleOAuthRedirect(req.user, res, req.body?.state);
  }

  /**
   * Maneja la redirección hacia Apps Móviles (Deep Link) o Admin Web
   */
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

    // Apps móviles (passenger_app o driver_app)
    const scheme = appSource === 'DRIVER_APP' ? 'likoradriver' : 'likora';
    const deepLink = `${scheme}://oauth/success?access_token=${token}&refresh_token=${refreshToken}`;
    return res.redirect(deepLink);
  }
}
