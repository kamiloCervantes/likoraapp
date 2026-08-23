import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'El número de teléfono debe tener formato E.164' })
  phone_number?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString()
  display_name: string;

  @IsOptional()
  @IsString()
  birth_date?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol especificado no es válido' })
  role?: UserRole;
}
