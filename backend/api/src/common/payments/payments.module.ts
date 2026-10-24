import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentConfig } from './entities/payment-config.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentsService } from './payments.service';
import { PaymentsAdminController } from './payments-admin.controller';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentConfig, PaymentTransaction]),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsAdminController, PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
