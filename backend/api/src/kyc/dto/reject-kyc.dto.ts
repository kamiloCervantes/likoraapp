import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum KycRejectionReason {
  BLURRY_IMAGE = 'BLURRY_IMAGE',
  EXPIRED_DOCUMENT = 'EXPIRED_DOCUMENT',
  UNDERAGE_DETECTED = 'UNDERAGE_DETECTED',
  NAME_MISMATCH = 'NAME_MISMATCH',
  INVALID_DOCUMENT = 'INVALID_DOCUMENT',
  UNREADABLE_TEXT = 'UNREADABLE_TEXT',
  OTHER = 'OTHER',
}

export class RejectKycDto {
  @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
  @IsEnum(KycRejectionReason, { message: 'Motivo de rechazo inválido' })
  reason: KycRejectionReason;

  @IsOptional()
  @IsString()
  custom_notes?: string;
}
