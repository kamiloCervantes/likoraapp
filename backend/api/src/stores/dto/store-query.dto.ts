import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PointOfSaleType } from '../entities/store.entity';

export class StoreQueryDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsEnum(PointOfSaleType)
  @IsOptional()
  pos_type?: PointOfSaleType;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
