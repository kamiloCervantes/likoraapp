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

  /**
   * Valida credenciales de login local (email + password)
   */
  async validateLocalUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.password_hash) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      return null;
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra suspendida.');
    }

    return user;
  }

  /**
   * Registro con Email y Password
   */
  async registerLocal(
    dto: RegisterDto,
    reqInfo: { ip: string; userAgent: string },
  ): Promise<AuthResponseDto> {
    const emailNorm = dto.email.toLowerCase().trim();

    const existingEmail = await this.userRepo.findOne({ where: { email: emailNorm } });
    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado');
    }

    if (dto.phone_number) {
      const existingPhone = await this.userRepo.findOne({
        where: { phone_number: dto.phone_number },
      });
      if (existingPhone) {
        throw new ConflictException('El número de teléfono ya se encuentra registrado');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      email: emailNorm,
      email_verified: false,
      phone_number: dto.phone_number || null,
      phone_verified: false,
      password_hash: passwordHash,
      display_name: dto.display_name,
      birth_date: dto.birth_date ? new Date(dto.birth_date) : null,
      role: UserRole.CONSUMER,
      status: UserStatus.ACTIVE,
      kyc_status: KycStatus.NOT_STARTED,
    });

    const savedUser = await this.userRepo.save(user);
    const appSource = dto.app_source || AppSource.CONSUMER_APP;

    return this.generateTokens(savedUser, appSource, reqInfo);
  }

  /**
   * Login Local
   */
  async loginLocal(
    dto: LoginDto,
    reqInfo: { ip: string; userAgent: string },
  ): Promise<AuthResponseDto> {
    const user = await this.validateLocalUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos');
    }

    const appSource = dto.app_source || AppSource.CONSUMER_APP;
    return this.generateTokens(user, appSource, reqInfo);
  }

  /**
   * Validación y Registro/Vinculación Segura OAuth (Google, Apple, Facebook, Microsoft)
   */
  async validateOAuthUser(
    profile: OAuthProfileDto,
    appSource: AppSource,
    reqInfo: { ip: string; userAgent: string },
  ): Promise<AuthResponseDto> {
    // 1. Buscar si ya existe la identidad federada vinculada
    let federated = await this.federatedRepo.findOne({
      where: { provider: profile.provider, provider_user_id: profile.provider_user_id },
      relations: ['user'],
    });

    let user: User;

    if (federated && federated.user) {
      user = federated.user;
      if (user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('La cuenta de usuario se encuentra suspendida.');
      }
      // Actualizar datos del perfil si cambiaron
      if (profile.raw_profile) {
        federated.raw_profile_data = profile.raw_profile;
        await this.federatedRepo.save(federated);
      }
    } else {
      // 2. Si no existe identidad federada, verificar si ya existe un usuario con el mismo email (Safe Account Linking)
      const emailNorm = profile.email ? profile.email.toLowerCase().trim() : null;
      let existingUser: User | null = null;

      if (emailNorm) {
        existingUser = await this.userRepo.findOne({ where: { email: emailNorm } });
      }

      if (existingUser) {
        // Safe Account Linking: Vincular la nueva identidad social al usuario existente
        user = existingUser;
        if (profile.email_verified && !user.email_verified) {
          user.email_verified = true;
          await this.userRepo.save(user);
        }
      } else {
        // Crear nuevo usuario
        const newUser = this.userRepo.create({
          email: emailNorm,
          email_verified: profile.email_verified ?? false,
          display_name: profile.display_name,
          role: UserRole.CONSUMER,
          status: UserStatus.ACTIVE,
          kyc_status: KycStatus.NOT_STARTED,
        });
        user = await this.userRepo.save(newUser);
      }

      // Crear registro de FederatedIdentity
      federated = this.federatedRepo.create({
        user_id: user.id,
        provider: profile.provider,
        provider_user_id: profile.provider_user_id,
        email_at_provider: emailNorm,
        raw_profile_data: profile.raw_profile || null,
      });
      await this.federatedRepo.save(federated);
    }

    return this.generateTokens(user, appSource, reqInfo);
  }

  /**
   * Generación de Tokens (Access Token 15m + Refresh Token 7d) y registro de Sesión
   */
  async generateTokens(
    user: User,
    appSource: AppSource,
    reqInfo: { ip: string; userAgent: string },
  ): Promise<AuthResponseDto> {
    // 1. Generar token opaco criptográfico para refresh
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    // 2. Crear sesión en PostgreSQL (7 días de vigencia)
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

    // 3. Registrar sesión activa en Redis
    const ttlSeconds = 7 * 24 * 60 * 60;
    await this.redisService.set(
      `session:${savedSession.id}`,
      JSON.stringify({ userId: user.id, role: user.role, appSource }),
      ttlSeconds,
    );
    await this.redisService.sadd(`user_sessions:${user.id}`, savedSession.id);

    // 4. Firmar Access Token JWT (15 minutos)
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
      expires_in: 900, // 15 minutos en segundos
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

  /**
   * Refresh Token Rotation: Invalida el token anterior y emite uno nuevo
   */
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

    // Detección de Reutilización de Tokens Revocados (Reuse Detection)
    if (session.is_revoked) {
      // Posible ataque de repetición: Revocar TODAS las sesiones activas del usuario
      await this.revokeAllUserSessions(session.user_id);
      throw new UnauthorizedException(
        'Alerta de seguridad: Intento de reutilización de sesión revocada. Todas las sesiones activas han sido cerradas.',
      );
    }

    // Verificar hash
    if (session.refresh_token_hash !== refreshTokenHash) {
      await this.revokeAllUserSessions(session.user_id);
      throw new UnauthorizedException('Token de refresco inválido');
    }

    // Verificar expiración
    if (new Date() > session.expires_at) {
      session.is_revoked = true;
      await this.sessionRepo.save(session);
      throw new UnauthorizedException('El refresh token ha expirado. Inicie sesión nuevamente.');
    }

    // 1. Invalidar la sesión usada
    session.is_revoked = true;
    await this.sessionRepo.save(session);
    await this.redisService.blacklistToken(sessionId, 60 * 60);

    // 2. Generar nueva sesión y tokens (Rotation)
    return this.generateTokens(session.user, session.app_source, reqInfo);
  }

  /**
   * Logout: Revoca sesión en DB y agrega a blacklist en Redis
   */
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

  /**
   * Revocar todas las sesiones de un usuario
   */
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
