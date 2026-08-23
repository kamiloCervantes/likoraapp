import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { DocumentType } from '../../common/enums/document-type.enum';

export class RequestKycUploadDto {
  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  @IsEnum(DocumentType, { message: 'Tipo de documento no soportado' })
  document_type: DocumentType;

  @IsOptional()
  @IsBoolean()
  has_back_image?: boolean = true;
}
