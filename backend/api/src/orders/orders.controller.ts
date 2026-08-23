import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KycGuard } from '../common/guards/kyc.guard';
import { RequireKyc } from '../common/decorators/require-kyc.decorator';
import { KycStatus } from '../common/enums/kyc-status.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  @Post('checkout-test')
  @RequireKyc(KycStatus.VERIFIED)
  @UseGuards(KycGuard)
  @HttpCode(HttpStatus.OK)
  checkoutTest(@CurrentUser() user: User) {
    return {
      success: true,
      message: 'Checkout autorizado exitosamente. El usuario cuenta con verificación legal KYC para comprar bebidas alcohólicas.',
      userId: user.id,
      kycStatus: user.kyc_status,
      timestamp: new Date().toISOString(),
    };
  }
}
