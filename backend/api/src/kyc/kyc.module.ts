import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityVerification } from './entities/identity-verification.entity';
import { User } from '../users/entities/user.entity';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { AdminKycController } from './admin-kyc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IdentityVerification, User])],
  controllers: [KycController, AdminKycController],
  providers: [KycService],
  exports: [KycService, TypeOrmModule],
})
export class KycModule {}
