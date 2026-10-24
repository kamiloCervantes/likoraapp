import { IsString, IsOptional, IsUUID, IsNumber, IsInt, Min, IsIn, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductSearchQueryDto {
  @IsUUID('all')
  @IsOptional()
  store_id?: string;

  @IsString()
  @IsOptional()
  q?: string;

  @IsUUID('all')
  @IsOptional()
  category_id?: string;

  @IsUUID('all')
  @IsOptional()
  subcategory_id?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  is_offer?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  min_price?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  max_price?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  user_lat?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  user_lng?: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  expand_stores?: boolean = true;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 50;

  @IsString()
  @IsIn(['price_asc', 'price_desc', 'name_asc', 'newest', 'relevance'])
  @IsOptional()
  sort?: string = 'newest';
}
