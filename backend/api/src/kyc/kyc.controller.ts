import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { RequestKycUploadDto } from './dto/request-kyc-upload.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload-urls')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONSUMER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async requestUploadUrls(
    @CurrentUser() user: User,
    @Body() dto: RequestKycUploadDto,
  ) {
    return this.kycService.requestUploadUrls(user.id, dto);
  }

  @Post('submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONSUMER, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async submitVerification(
    @CurrentUser() user: User,
    @Body() dto: SubmitKycDto,
  ) {
    return this.kycService.submitVerification(user.id, dto);
  }

  @Get('status')
  async getMyStatus(@CurrentUser() user: User) {
    return this.kycService.getMyKycStatus(user.id);
  }
}
