import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsUUID,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID válido' })
  @IsNotEmpty()
  category_id: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(220)
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

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
  is_active?: boolean;
}
