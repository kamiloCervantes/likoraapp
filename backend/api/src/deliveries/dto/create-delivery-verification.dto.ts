import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateDeliveryVerificationDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsOptional()
  @IsString()
  driver_id?: string;

  @IsOptional()
  @IsString()
  driver_name?: string;

  @IsNotEmpty()
  @IsString()
  receiver_name: string;

  @IsOptional()
  @IsString()
  receiver_id_number?: string;

  @IsOptional()
  @IsString()
  receiver_relationship?: string;

  @IsNotEmpty()
  @IsString()
  id_image_url: string;

  @IsOptional()
  @IsString()
  signature_url?: string;

  @IsNumber()
  delivery_latitude: number;

  @IsNumber()
  delivery_longitude: number;

  @IsOptional()
  @IsString()
  delivery_address?: string;

  @IsOptional()
  @IsNumber()
  delivery_accuracy?: number;

  @IsOptional()
  @IsString()
  verification_status?: string;

  @IsOptional()
  @IsBoolean()
  is_adult_verified?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
