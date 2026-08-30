import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MaxLength, Min, Max } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'El alias de la dirección es requerido (ej: Casa, Trabajo)' })
  @MaxLength(50)
  alias: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección detallada es requerida' })
  street_address: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsBoolean()
  @IsOptional()
  setActive?: boolean;
}
