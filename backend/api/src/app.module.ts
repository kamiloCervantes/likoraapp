import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { KycModule } from './kyc/kyc.module';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { StorageModule } from './common/storage/storage.module';
import { EmailModule } from './common/email/email.module';

import { User } from './users/entities/user.entity';
import { FederatedIdentity } from './auth/entities/federated-identity.entity';
import { IdentityVerification } from './kyc/entities/identity-verification.entity';
import { UserSession } from './auth/entities/user-session.entity';
import { StorageConfig } from './common/storage/entities/storage-config.entity';
import { EmailConfig } from './common/email/entities/email-config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'likora_user'),
        password: configService.get<string>('DATABASE_PASSWORD', 'likora_secret'),
        database: configService.get<string>('DATABASE_NAME', 'likora_db'),
        entities: [User, FederatedIdentity, IdentityVerification, UserSession, StorageConfig, EmailConfig],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    RedisModule,
    CryptoModule,
    StorageModule,
    EmailModule,
    UsersModule,
    AuthModule,
    KycModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
