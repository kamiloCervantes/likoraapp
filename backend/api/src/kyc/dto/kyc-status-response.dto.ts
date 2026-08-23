import { KycStatus } from '../../common/enums/kyc-status.enum';
import { DocumentType } from '../../common/enums/document-type.enum';

export class KycStatusResponseDto {
  user_id: string;
  kyc_status: KycStatus;
  is_adult: boolean;
  can_purchase_alcohol: boolean;
  last_verification?: {
    id: string;
    document_type: DocumentType;
    status: KycStatus;
    rejection_reason?: string | null;
    submitted_at: Date;
    verified_at?: Date | null;
    expires_at?: Date | null;
  } | null;
}
