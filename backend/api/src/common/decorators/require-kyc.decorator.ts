import { SetMetadata } from '@nestjs/common';
import { KycStatus } from '../enums/kyc-status.enum';

export const REQUIRE_KYC_KEY = 'require_kyc';
export const RequireKyc = (status: KycStatus = KycStatus.VERIFIED) =>
  SetMetadata(REQUIRE_KYC_KEY, status);
