import { KycStatus } from '../../common/enums/kyc-status.enum';
import { DocumentType } from '../../common/enums/document-type.enum';

export class KycDetailResponseDto {
  id: string;
  user: {
    id: string;
    display_name: string;
    email: string | null;
    phone_number: string | null;
    birth_date: Date | null;
  };
  document_type: DocumentType;
  decrypted_document_number: string;
  extracted_birth_date: Date;
  calculated_age: number;
  is_legal_age: boolean;
  front_image_url: string;
  back_image_url: string | null;
  selfie_image_url: string;
  status: KycStatus;
  rejection_reason: string | null;
  reviewed_by_user_id: string | null;
  verified_at: Date | null;
  expires_at: Date | null;
  created_at: Date;
}
