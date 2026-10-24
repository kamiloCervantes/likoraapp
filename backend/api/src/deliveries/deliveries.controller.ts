import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryVerificationDto } from './dto/create-delivery-verification.dto';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  /**
   * Endpoint invocado por la App del Conductor al completar la entrega con foto del ID.
   */
  @Post('verify')
  @HttpCode(HttpStatus.CREATED)
  async verifyDelivery(@Body() dto: CreateDeliveryVerificationDto) {
    const verification = await this.deliveriesService.createVerification(dto);
    return {
      status: 'success',
      message: 'Entrega verificada y registrada exitosamente en bitácora de entrega',
      data: verification,
    };
  }

  /**
   * Lista todas las entregas verificadas para supervisión y auditoría en el panel administrativo.
   */
  @Get('verifications')
  async getAllVerifications() {
    const list = await this.deliveriesService.getAllVerifications();
    return {
      status: 'success',
      total: list.length,
      data: list,
    };
  }

  /**
   * Consulta el acta y foto de verificación de un pedido específico.
   */
  @Get('verifications/:orderId')
  async getVerificationByOrderId(@Param('orderId') orderId: string) {
    const record = await this.deliveriesService.getVerificationByOrderId(orderId);
    return {
      status: 'success',
      data: record,
    };
  }
}
