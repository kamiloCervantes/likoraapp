import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { RejectKycDto } from './dto/reject-kyc.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('admin/kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminKycController {
  constructor(private readonly kycService: KycService) {}

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async getPending(@Query() paginationDto: PaginationDto) {
    return this.kycService.getPendingVerifications(paginationDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  async getDetail(@Param('id') id: string) {
    return this.kycService.getVerificationDetail(id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approveVerification(
    @Param('id') id: string,
    @CurrentUser() adminUser: User,
  ) {
    return this.kycService.approveVerification(id, adminUser.id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async rejectVerification(
    @Param('id') id: string,
    @CurrentUser() adminUser: User,
    @Body() dto: RejectKycDto,
  ) {
    return this.kycService.rejectVerification(id, adminUser.id, dto);
  }
}
