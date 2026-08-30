import { EmailService } from '../common/email/email.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { FederatedIdentity } from './entities/federated-identity.entity';
import { UserSession } from './entities/user-session.entity';
import { RedisService } from '../redis/redis.service';
import { AuthProvider } from '../common/enums/auth-provider.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { KycStatus } from '../common/enums/kyc-status.enum';
import { AppSource } from '../common/enums/app-source.enum';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService (Likora API)', () => {
  let service: AuthService;
  let userRepoMock: any;
  let federatedRepoMock: any;
  let sessionRepoMock: any;
  let jwtServiceMock: any;
  let redisServiceMock: any;

  beforeEach(async () => {
    userRepoMock = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 'user-uuid-1' })),
      save: jest.fn().mockImplementation((u) => Promise.resolve({ ...u, id: u.id || 'user-uuid-1' })),
    };

    federatedRepoMock = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 'fed-uuid-1' })),
      save: jest.fn().mockImplementation((f) => Promise.resolve({ ...f, id: f.id || 'fed-uuid-1' })),
    };

    sessionRepoMock = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 'sess-uuid-1' })),
      save: jest.fn().mockImplementation((s) => Promise.resolve({ ...s, id: s.id || 'sess-uuid-1' })),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mocked.jwt.token'),
    };

    redisServiceMock = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(undefined),
      sadd: jest.fn().mockResolvedValue(undefined),
      srem: jest.fn().mockResolvedValue(undefined),
      smembers: jest.fn().mockResolvedValue([]),
      blacklistToken: jest.fn().mockResolvedValue(undefined),
      isTokenBlacklisted: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: EmailService, useValue: { sendVerificationEmail: jest.fn().mockResolvedValue(true) } },
                AuthService,
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: getRepositoryToken(FederatedIdentity), useValue: federatedRepoMock },
        { provide: getRepositoryToken(UserSession), useValue: sessionRepoMock },
        { provide: JwtService, useValue: jwtServiceMock },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('mock-val') },
        },
        { provide: RedisService, useValue: redisServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Registro y Login Local', () => {
    it('debe registrar un nuevo usuario local y emitir tokens', async () => {
      userRepoMock.findOne.mockResolvedValue(null);

      const res = await service.registerLocal(
        {
          email: 'nuevo@likora.com',
          password: 'Password123!',
          display_name: 'Juan Perez',
        },
        { ip: '127.0.0.1', userAgent: 'Jest' },
      );

      expect(res).toBeDefined();
      expect(res.access_token).toBe('mocked.jwt.token');
      expect(res.user.email).toBe('nuevo@likora.com');
      expect(userRepoMock.save).toHaveBeenCalled();
      expect(sessionRepoMock.save).toHaveBeenCalled();
    });

    it('debe iniciar sesión correctamente si el password coincide con bcrypt', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword123', 10);
      userRepoMock.findOne.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'user@likora.com',
        password_hash: passwordHash,
        display_name: 'Test User',
        role: UserRole.CONSUMER,
        status: UserStatus.ACTIVE,
        kyc_status: KycStatus.NOT_STARTED,
      });

      const res = await service.loginLocal(
        {
          email: 'user@likora.com',
          password: 'CorrectPassword123',
        },
        { ip: '127.0.0.1', userAgent: 'Jest' },
      );

      expect(res).toBeDefined();
      expect(res.access_token).toBe('mocked.jwt.token');
    });

    it('debe rechazar login si la contraseña es incorrecta', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword123', 10);
      userRepoMock.findOne.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'user@likora.com',
        password_hash: passwordHash,
        display_name: 'Test User',
      });

      await expect(
        service.loginLocal(
          {
            email: 'user@likora.com',
            password: 'WrongPassword!',
          },
          { ip: '127.0.0.1', userAgent: 'Jest' },
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('OAuth y Safe Account Linking', () => {
    it('debe registrar un nuevo usuario federado si no existe previamente', async () => {
      federatedRepoMock.findOne.mockResolvedValue(null);
      userRepoMock.findOne.mockResolvedValue(null);

      const res = await service.validateOAuthUser(
        {
          provider: AuthProvider.GOOGLE,
          provider_user_id: 'google-sub-12345',
          email: 'googleuser@gmail.com',
          email_verified: true,
          display_name: 'Google User',
        },
        AppSource.CONSUMER_APP,
        { ip: '127.0.0.1', userAgent: 'Jest' },
      );

      expect(res.access_token).toBe('mocked.jwt.token');
      expect(userRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'googleuser@gmail.com',
          role: UserRole.CONSUMER,
        }),
      );
      expect(federatedRepoMock.save).toHaveBeenCalled();
    });

    it('Safe Account Linking: debe vincular nueva identidad social a un usuario existente con el mismo email verificado', async () => {
      federatedRepoMock.findOne.mockResolvedValue(null);
      const existingUser: Partial<User> = {
        id: 'existing-user-uuid',
        email: 'verified@likora.com',
        email_verified: true,
        display_name: 'Usuario Existente',
        role: UserRole.CONSUMER,
        status: UserStatus.ACTIVE,
        kyc_status: KycStatus.NOT_STARTED,
      };
      userRepoMock.findOne.mockResolvedValue(existingUser);

      const res = await service.validateOAuthUser(
        {
          provider: AuthProvider.APPLE,
          provider_user_id: 'apple-sub-67890',
          email: 'verified@likora.com',
          email_verified: true,
          display_name: 'Apple User',
        },
        AppSource.CONSUMER_APP,
        { ip: '127.0.0.1', userAgent: 'Jest' },
      );

      expect(res.access_token).toBe('mocked.jwt.token');
      expect(federatedRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'existing-user-uuid',
          provider: AuthProvider.APPLE,
          provider_user_id: 'apple-sub-67890',
        }),
      );
    });
  });

  describe('Refresh Token Rotation & Security', () => {
    it('debe detectar reutilización de refresh token revocado y revocar todas las sesiones del usuario', async () => {
      const revokedSession = {
        id: 'session-id-123',
        user_id: 'compromised-user-id',
        is_revoked: true,
        user: { id: 'compromised-user-id' },
      };
      sessionRepoMock.findOne.mockResolvedValue(revokedSession);

      const spyRevoke = jest.spyOn(service, 'revokeAllUserSessions');

      await expect(
        service.refreshTokens('session-id-123.someRawToken', {
          ip: '127.0.0.1',
          userAgent: 'Jest',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(spyRevoke).toHaveBeenCalledWith('compromised-user-id');
    });

    it('Logout debe revocar la sesión y agregarla a la blacklist de Redis', async () => {
      sessionRepoMock.findOne.mockResolvedValue({
        id: 'session-id-logout',
        user_id: 'user-id-1',
        is_revoked: false,
      });

      const res = await service.logout('user-id-1', 'session-id-logout');

      expect(res.success).toBe(true);
      expect(redisServiceMock.blacklistToken).toHaveBeenCalledWith('session-id-logout', 86400);
      expect(redisServiceMock.del).toHaveBeenCalledWith('session:session-id-logout');
    });
  });
});
