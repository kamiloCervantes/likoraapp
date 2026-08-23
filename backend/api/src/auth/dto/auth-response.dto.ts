import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string = 'Bearer';
  user: UserResponseDto;
}
