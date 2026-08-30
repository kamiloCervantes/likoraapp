import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength, Min, Max } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  alias?: string;

  @IsString()
  @IsOptional()
  street_address?: string;

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
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
