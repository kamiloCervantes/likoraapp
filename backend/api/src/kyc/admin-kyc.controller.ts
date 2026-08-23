import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { RejectKycDto } from './dto/reject-kyc.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('admin/kyc')
export class AdminKycController {
  constructor(private readonly kycService: KycService) {}

  @Get('list')
  async getList(
    @Query('status') status: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.kycService.getVerifications(status, paginationDto);
  }

  @Get('pending')
  async getPending(@Query() paginationDto: PaginationDto) {
    return this.kycService.getPendingVerifications(paginationDto);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.kycService.getVerificationDetail(id);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveVerification(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id || 'admin-system-id';
    return this.kycService.approveVerification(id, adminId);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectVerification(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: RejectKycDto,
  ) {
    const adminId = req.user?.id || 'admin-system-id';
    return this.kycService.rejectVerification(id, adminId, dto);
  }
}
