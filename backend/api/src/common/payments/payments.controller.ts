import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config/payments')
  async getPublicConfig() {
    const config = await this.paymentsService.getPublicClientConfig();
    return {
      status: 'success',
      data: config,
    };
  }

  @Post('payments/create-intent')
  @HttpCode(HttpStatus.OK)
  async createPaymentIntent(
    @Body()
    dto: {
      amount: number;
      currency?: string;
      customer_email?: string;
      order_id?: string;
      user_id?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const intent = await this.paymentsService.createPaymentIntent(dto);
    return {
      status: 'success',
      data: intent,
    };
  }

  @Post('payments/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(
    @Body()
    dto: {
      payment_intent_id: string;
      card_last4?: string;
      brand?: string;
      customer_name?: string;
    },
  ) {
    const result = await this.paymentsService.confirmPayment(dto);
    return {
      status: 'success',
      data: result,
    };
  }
}
