import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryVerification } from './entities/delivery-verification.entity';
import { CreateDeliveryVerificationDto } from './dto/create-delivery-verification.dto';
import { DriverLocation } from '../tracking/entities/driver-location.entity';

@Injectable()
export class DeliveriesService {
  private readonly logger = new Logger(DeliveriesService.name);

  constructor(
    @InjectRepository(DeliveryVerification)
    private readonly verificationRepo: Repository<DeliveryVerification>,
    @InjectRepository(DriverLocation)
    private readonly driverLocationRepo: Repository<DriverLocation>,
  ) {}

  async createVerification(dto: CreateDeliveryVerificationDto): Promise<DeliveryVerification> {
    this.logger.log(`Registrando acta de entrega y verificación de ID para pedido #${dto.order_id}...`);

    const verification = this.verificationRepo.create({
      order_id: dto.order_id,
      driver_id: dto.driver_id || 'drv-carlos-mendoza-01',
      driver_name: dto.driver_name || 'Carlos Mendoza',
      receiver_name: dto.receiver_name,
      receiver_id_number: dto.receiver_id_number || null,
      receiver_relationship: dto.receiver_relationship || 'TITULAR',
      id_image_url: dto.id_image_url,
      signature_url: dto.signature_url || null,
      delivery_latitude: dto.delivery_latitude,
      delivery_longitude: dto.delivery_longitude,
      delivery_address: dto.delivery_address || 'Dirección de Entrega',
      delivery_accuracy: dto.delivery_accuracy ?? 3.0,
      verification_status: dto.verification_status || 'VERIFICADO',
      is_adult_verified: dto.is_adult_verified ?? true,
      notes: dto.notes || null,
      delivered_at: new Date(),
    });

    const saved = await this.verificationRepo.save(verification);

    // Actualizar estado en telemetría de conductor si existe
    try {
      const activeDriver = await this.driverLocationRepo.findOne({
        where: [
          { order_id: dto.order_id },
          { driver_id: dto.driver_id || 'drv-carlos-mendoza-01' },
        ],
        order: { updated_at: 'DESC' },
      });

      if (activeDriver) {
        activeDriver.status = 'ENTREGADO';
        activeDriver.speed_kmh = 0.0;
        activeDriver.latitude = dto.delivery_latitude;
        activeDriver.longitude = dto.delivery_longitude;
        activeDriver.updated_at = new Date();
        await this.driverLocationRepo.save(activeDriver);
      }
    } catch (e) {
      this.logger.warn(`No se pudo actualizar telemetría a ENTREGADO: ${e.message}`);
    }

    this.logger.log(`✅ Entrega de pedido #${saved.order_id} verificada con éxito. Receptor: ${saved.receiver_name}`);
    return saved;
  }

  async getAllVerifications(): Promise<DeliveryVerification[]> {
    return this.verificationRepo.find({
      order: { delivered_at: 'DESC' },
    });
  }

  async getVerificationByOrderId(orderId: string): Promise<DeliveryVerification> {
    const record = await this.verificationRepo.findOne({
      where: { order_id: orderId },
      order: { delivered_at: 'DESC' },
    });
    if (!record) {
      throw new NotFoundException(`No se encontró verificación para el pedido #${orderId}`);
    }
    return record;
  }

  async getVerificationById(id: string): Promise<DeliveryVerification> {
    const record = await this.verificationRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Verificación de entrega con ID ${id} no encontrada`);
    }
    return record;
  }
}
