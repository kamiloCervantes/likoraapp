import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { AppSource } from '../../common/enums/app-source.enum';

export class RegisterDto {
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Formato de correo electrónico inválido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @IsString()
  display_name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'El teléfono debe tener formato internacional E.164' })
  phone_number?: string;

  @IsOptional()
  @IsString()
  birth_date?: string;

  @IsOptional()
  @IsEnum(AppSource)
  app_source?: AppSource = AppSource.CONSUMER_APP;
}
