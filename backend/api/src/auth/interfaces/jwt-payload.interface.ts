import { UserRole } from '../../common/enums/user-role.enum';
import { KycStatus } from '../../common/enums/kyc-status.enum';

export interface JwtPayload {
  sub: string;
  email: string | null;
  role: UserRole;
  kycStatus: KycStatus;
  sessionId: string;
  iat?: number;
  exp?: number;
}
