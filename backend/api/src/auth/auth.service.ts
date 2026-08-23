import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../users/entities/user.entity';
import { FederatedIdentity } from './entities/federated-identity.entity';
import { UserSession } from './entities/user-session.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthProfileDto } from './dto/oauth-profile.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RedisService } from '../redis/redis.service';

import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { AuthProvider } from '../common/enums/auth-provider.enum';
import { KycStatus } from '../common/enums/kyc-status.enum';
import { AppSource } from '../common/enums/app-source.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(FederatedIdentity)
    private readonly federatedRepo: Repository<FederatedIdentity>,
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async registerLocal(dto: RegisterDto, reqInfo: { ip: string; userAgent: string }): Promise<AuthResponseDto> {
    const emailNorm = dto.email ? dto.email.toLowerCase().trim() : null;
    const phoneNorm = dto.phone_number ? dto.phone_number.trim() : null;

    if (emailNorm) {
      const existing = await this.userRepo.findOne({ where: { email: emailNorm } });
      if (existing) {
        throw new ConflictException('El correo electrónico ya se encuentra registrado.');
      }
    }

    if (phoneNorm) {
      const existing = await this.userRepo.findOne({ where: { phone_number: phoneNorm } });
      if (existing) {
        throw new ConflictException('El número de teléfono ya se encuentra registrado.');
      }
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const newUser = this.userRepo.create({
      email: emailNorm,
      phone_number: phoneNorm,
      password_hash: passwordHash,
      display_name: dto.display_name.trim(),
      birth_date: dto.birth_date ? new Date(dto.birth_date) : null,
      role: UserRole.CONSUMER,
      status: UserStatus.ACTIVE,
      kyc_status: KycStatus.NOT_STARTED,
    });

    const savedUser = await this.userRepo.save(newUser);
    const authRes = await this.generateTokens(savedUser, AppSource.CONSUMER_APP, reqInfo);
    return { ...authRes, is_new_user: true } as any;
  }

  async validateLocalUser(email: string, password: string): Promise<User> {
    const identifier = email.toLowerCase().trim();
    const user = await this.userRepo.findOne({
      where: [{ email: identifier }, { phone_number: identifier }],
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra suspendida.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  async loginLocal(dto: LoginDto, reqInfo: { ip: string; userAgent: string }): Promise<AuthResponseDto> {
    const identifier = dto.email.toLowerCase().trim();
    const user = await this.userRepo.findOne({
      where: [{ email: identifier }, { phone_number: identifier }],
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra suspendida.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateTokens(user, AppSource.CONSUMER_APP, reqInfo);
  }

  async authenticateGoogleIdToken(
    idToken: string,
    appSource: AppSource = AppSource.CONSUMER_APP,
    reqInfo: { ip: string; userAgent: string },
    isRegistrationFlow: boolean = false,
  ): Promise<any> {
    if (!idToken) {
      throw new BadRequestException('El id_token de Google es obligatorio.');
    }

    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        throw new UnauthorizedException('Token de Google inválido o expirado.');
      }

      const payload = await response.json();
      const googleUserId = payload.sub;
      const email = payload.email;
      const emailVerified = payload.email_verified === 'true' || payload.email_verified === true;
      const displayName = payload.name || payload.given_name || 'Usuario Google';

      const oauthResult = await this.validateOAuthUser(
        {
          provider: AuthProvider.GOOGLE,
          provider_user_id: googleUserId,
          email: email,
          email_verified: emailVerified,
          display_name: displayName,
          raw_profile: payload,
        },
        appSource,
        reqInfo,
      );

      // Si el usuario intentó registrarse pero ya estaba registrado previamente
      if (isRegistrationFlow && !oauthResult.is_new_user) {
        return {
          ...oauthResult,
          already_registered: true,
          message: `La cuenta de Google (${email}) ya se encuentra registrada en Likora.`,
        };
      }

      return oauthResult;
    } catch (e: any) {
      if (e instanceof UnauthorizedException || e instanceof BadRequestException) {
        throw e;
      }
      throw new UnauthorizedException(`Fallo al verificar credenciales con Google: ${e.message || e}`);
    }
  }

  async validateOAuthUser(
    profile: OAuthProfileDto,
    appSource: AppSource,
    reqInfo: { ip: string; userAgent: string },
  ): Promise<AuthResponseDto & { is_new_user: boolean }> {
    let federated = await this.federatedRepo.findOne({
      where: { provider: profile.provider, provider_user_id: profile.provider_user_id },
      relations: ['user'],
    });

    let user: User;
    let isNewUser = false;

    if (federated && federated.user) {
      user = federated.user;
      isNewUser = false;
      if (user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('La cuenta de usuario se encuentra suspendida.');
      }
      if (profile.raw_profile) {
        federated.raw_profile_data = profile.raw_profile;
        await this.federatedRepo.save(federated);
      }
    } else {
      const emailNorm = profile.email ? profile.email.toLowerCase().trim() : null;
      let existingUser: User | null = null;

      if (emailNorm) {
        existingUser = await this.userRepo.findOne({ where: { email: emailNorm } });
      }

      if (existingUser) {
        user = existingUser;
        isNewUser = false;
        if (profile.email_verified && !user.email_verified) {
          user.email_verified = true;
          await this.userRepo.save(user);
        }
      } else {
        const newUser = this.userRepo.create({
          email: emailNorm,
          email_verified: profile.email_verified ?? false,
          display_name: profile.display_name,
          role: UserRole.CONSUMER,
          status: UserStatus.ACTIVE,
          kyc_status: KycStatus.NOT_STARTED,
        });
        user = await this.userRepo.save(newUser);
        isNewUser = true;
      }

      federated = this.federatedRepo.create({
        user_id: user.id,
        provider: profile.provider,
        provider_user_id: profile.provider_user_id,
        email_at_provider: emailNorm,
        raw_profile_data: profile.raw_profile || null,
      });
      await this.federatedRepo.save(federated);
    }

    const tokens = await this.generateTokens(user, appSource, reqInfo);
    return {
      ...tokens,
      is_new_user: isNewUser,
    };
  }

  async generateTokens(
    user: User,
    appSource: AppSource,
    reqInfo: { ip: string; userAgent: string },
  ): Promise<AuthResponseDto> {
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = this.sessionRepo.create({
      user_id: user.id,
      refresh_token_hash: refreshTokenHash,
      app_source: appSource,
      ip_address: reqInfo.ip || '127.0.0.1',
      user_agent: reqInfo.userAgent || 'Unknown',
      is_revoked: false,
      expires_at: expiresAt,
    });

    const savedSession = await this.sessionRepo.save(session);

    const ttlSeconds = 7 * 24 * 60 * 60;
    await this.redisService.set(
      `session:${savedSession.id}`,
      JSON.stringify({ userId: user.id, role: user.role, appSource }),
      ttlSeconds,
    );
    await this.redisService.sadd(`user_sessions:${user.id}`, savedSession.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kyc_status,
      sessionId: savedSession.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    return {
      access_token: accessToken,
      refresh_token: `${savedSession.id}.${rawRefreshToken}`,
      expires_in: 900,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
        phone_number: user.phone_number,
        phone_verified: user.phone_verified,
        display_name: user.display_name,
        birth_date: user.birth_date,
        role: user.role,
        status: user.status,
        kyc_status: user.kyc_status,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  async refreshTokens(
    combinedRefreshToken: string,
    reqInfo: { ip: string; userAgent: string },
  ): Promise<AuthResponseDto> {
    const parts = combinedRefreshToken.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Formato de refresh token inválido');
    }

    const [sessionId, rawRefreshToken] = parts;
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });

    if (!session) {
      throw new UnauthorizedException('Sesión no encontrada');
    }

    if (session.is_revoked) {
      await this.revokeAllUserSessions(session.user_id);
      throw new UnauthorizedException(
        'Alerta de seguridad: Intento de reutilización de sesión revocada. Todas las sesiones activas han sido cerradas.',
      );
    }

    if (session.refresh_token_hash !== refreshTokenHash) {
      await this.revokeAllUserSessions(session.user_id);
      throw new UnauthorizedException('Token de refresco inválido');
    }

    if (new Date() > session.expires_at) {
      session.is_revoked = true;
      await this.sessionRepo.save(session);
      throw new UnauthorizedException('El refresh token ha expirado. Inicie sesión nuevamente.');
    }

    session.is_revoked = true;
    await this.sessionRepo.save(session);
    await this.redisService.blacklistToken(sessionId, 60 * 60);

    return this.generateTokens(session.user, session.app_source, reqInfo);
  }

  async logout(userId: string, sessionId?: string): Promise<{ success: boolean; message: string }> {
    if (sessionId) {
      const session = await this.sessionRepo.findOne({ where: { id: sessionId, user_id: userId } });
      if (session) {
        session.is_revoked = true;
        await this.sessionRepo.save(session);
      }
      await this.redisService.blacklistToken(sessionId, 24 * 60 * 60);
      await this.redisService.del(`session:${sessionId}`);
      await this.redisService.srem(`user_sessions:${userId}`, sessionId);
    }
    return { success: true, message: 'Sesión cerrada exitosamente' };
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepo.update({ user_id: userId, is_revoked: false }, { is_revoked: true });
    const sessionIds = await this.redisService.smembers(`user_sessions:${userId}`);
    for (const sid of sessionIds) {
      await this.redisService.blacklistToken(sid, 24 * 60 * 60);
      await this.redisService.del(`session:${sid}`);
    }
    await this.redisService.del(`user_sessions:${userId}`);
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['federated_identities'],
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
}
