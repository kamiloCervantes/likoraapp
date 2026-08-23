import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { AuthProvider } from '../../common/enums/auth-provider.enum';

export class OAuthProfileDto {
  @IsNotEmpty()
  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @IsNotEmpty()
  @IsString()
  provider_user_id: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @IsNotEmpty()
  @IsString()
  display_name: string;

  @IsOptional()
  @IsObject()
  raw_profile?: Record<string, any>;
}
