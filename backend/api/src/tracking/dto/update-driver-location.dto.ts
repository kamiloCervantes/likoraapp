import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateDriverLocationDto {
  @IsOptional()
  @IsString()
  driver_id?: string;

  @IsOptional()
  @IsString()
  driver_name?: string;

  @IsOptional()
  @IsString()
  order_id?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  speed_kmh?: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsBoolean()
  is_online?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}
