import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RedisService } from '../../redis/redis.service';
import { UserStatus } from '../../common/enums/user-status.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.access_token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'likora_super_jwt_secret_key_2026!'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o sesión inválida');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra suspendida');
    }

    // Verificar si la sesión está revocada
    if (payload.sessionId) {
      const isBlacklisted = await this.redisService.isTokenBlacklisted(payload.sessionId);
      if (isBlacklisted) {
        throw new UnauthorizedException('La sesión ha sido revocada');
      }

      const session = await this.sessionRepo.findOne({ where: { id: payload.sessionId } });
      if (!session || session.is_revoked) {
        throw new UnauthorizedException('Sesión expirada o revocada');
      }
    }

    return user;
  }
}
