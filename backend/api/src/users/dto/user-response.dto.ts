import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { KycStatus } from '../../common/enums/kyc-status.enum';

export class UserResponseDto {
  id: string;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  phone_verified: boolean;
  display_name: string;
  birth_date: Date | null;
  role: UserRole;
  status: UserStatus;
  kyc_status: KycStatus;
  created_at: Date;
  updated_at: Date;
}
