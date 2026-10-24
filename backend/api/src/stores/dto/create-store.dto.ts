import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PointOfSaleType } from '../entities/store.entity';

export class CreateStoreDto {
  @IsString({ message: 'El nombre es requerido' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString({ message: 'La dirección es requerida' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  address: string;

  @IsString()
  @IsOptional()
  city?: string = 'Medellín';

  @IsString()
  @IsOptional()
  state?: string = 'Antioquia';

  @IsString()
  @IsOptional()
  country?: string = 'Colombia';

  @Type(() => Number)
  @IsNumber({}, { message: 'La latitud debe ser un valor numérico' })
  @Min(-90)
  @Max(90)
  latitude: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'La longitud debe ser un valor numérico' })
  @Min(-180)
  @Max(180)
  longitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  coverage_radius_km?: number = 5.0;

  @IsString()
  @IsOptional()
  opening_time?: string = '10:00';

  @IsString()
  @IsOptional()
  closing_time?: string = '02:00';

  @IsEnum(PointOfSaleType, { message: 'Tipo de punto de venta inválido' })
  @IsOptional()
  pos_type?: PointOfSaleType = PointOfSaleType.PHYSICAL_STORE;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @IsBoolean()
  @IsOptional()
  is_main?: boolean = false;
}
