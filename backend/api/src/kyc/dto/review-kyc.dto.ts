import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { KycStatus } from '../../common/enums/kyc-status.enum';

export class ReviewKycDto {
  @IsNotEmpty({ message: 'El estado de la revisión es obligatorio' })
  @IsEnum(KycStatus, { message: 'El estado debe ser VERIFIED o REJECTED' })
  status: KycStatus.VERIFIED | KycStatus.REJECTED;

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
