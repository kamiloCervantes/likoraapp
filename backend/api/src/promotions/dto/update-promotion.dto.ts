import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePromotionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  button_text?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  gradient_color1?: string;

  @IsString()
  @IsOptional()
  gradient_color2?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount_percentage?: number;

  @IsString()
  @IsOptional()
  discount_code?: string;

  @IsUUID('all')
  @IsOptional()
  store_id?: string;

  @IsUUID('all')
  @IsOptional()
  category_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsOptional()
  start_date?: Date;

  @IsOptional()
  end_date?: Date;
}
