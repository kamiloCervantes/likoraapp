import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityVerification } from './entities/identity-verification.entity';
import { User } from '../users/entities/user.entity';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { AdminKycController } from './admin-kyc.controller';
import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IdentityVerification, User]),
    StorageModule,
  ],
  controllers: [KycController, AdminKycController],
  providers: [KycService],
  exports: [KycService, TypeOrmModule],
})
export class KycModule {}
