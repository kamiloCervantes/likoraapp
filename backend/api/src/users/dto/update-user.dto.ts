import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  display_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'El número de teléfono debe tener formato E.164' })
  phone_number?: string;

  @IsOptional()
  @IsString()
  birth_date?: string;
}
