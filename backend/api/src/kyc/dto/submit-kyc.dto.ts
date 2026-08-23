import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Length,
} from 'class-validator';
import { DocumentType } from '../../common/enums/document-type.enum';

export class SubmitKycDto {
  @IsNotEmpty({ message: 'El ID de la sesión de verificación es requerido' })
  @IsString()
  verification_session_id: string;

  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  @IsEnum(DocumentType, { message: 'Tipo de documento no soportado' })
  document_type: DocumentType;

  @IsNotEmpty({ message: 'El número de documento es requerido' })
  @IsString()
  @Length(4, 30, { message: 'El documento debe tener entre 4 y 30 caracteres' })
  document_number: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento extraída es obligatoria' })
  @IsDateString({}, { message: 'La fecha de nacimiento debe estar en formato ISO (YYYY-MM-DD)' })
  extracted_birth_date: string;

  @IsNotEmpty({ message: 'La clave de imagen frontal es obligatoria' })
  @IsString()
  front_image_key: string;

  @IsOptional()
  @IsString()
  back_image_key?: string;

  @IsNotEmpty({ message: 'La clave de fotografía selfie es obligatoria' })
  @IsString()
  selfie_image_key: string;
}
