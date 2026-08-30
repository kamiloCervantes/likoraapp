import { IsString, IsOptional, IsUUID, IsNumber, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductSearchQueryDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsUUID('4')
  @IsOptional()
  category_id?: string;

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
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsIn(['price_asc', 'price_desc', 'name_asc', 'newest', 'relevance'])
  @IsOptional()
  sort?: string = 'newest';
}
