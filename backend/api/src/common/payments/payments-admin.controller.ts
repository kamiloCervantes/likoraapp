import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentConfig } from './entities/payment-config.entity';

@Controller('admin/payments')
export class PaymentsAdminController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  async getConfig() {
    const config = await this.paymentsService.getConfig();
    return {
      status: 'success',
      data: config,
    };
  }

  @Put('config')
  async updateConfig(@Body() dto: Partial<PaymentConfig>) {
    const updated = await this.paymentsService.updateConfig(dto);
    return {
      status: 'success',
      message: 'Credenciales y configuración de Stripe actualizadas exitosamente',
      data: updated,
    };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body('secret_key') secretKey?: string) {
    const result = await this.paymentsService.testConnection(secretKey);
    return {
      status: result.success ? 'success' : 'error',
      ...result,
    };
  }

  @Get('transactions')
  async getTransactions(@Query('limit') limit?: number) {
    const transactions = await this.paymentsService.getRecentTransactions(limit ? Number(limit) : 20);
    return {
      status: 'success',
      data: transactions,
    };
  }
}
