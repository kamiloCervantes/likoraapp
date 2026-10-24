import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsUUID,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsUUID('all')
  @IsOptional()
  store_id?: string;

  @IsUUID('all')
  @IsOptional()
  category_id?: string;

  @IsUUID('all')
  @IsOptional()
  subcategory_id?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(220)
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  compare_at_price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock_quantity?: number;

  @IsArray()
  @IsOptional()
  images?: Array<{ url: string; isCover?: boolean; alt?: string }>;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @IsBoolean()
  @IsOptional()
  is_offer?: boolean;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
