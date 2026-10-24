import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverLocation } from './entities/driver-location.entity';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';

@Injectable()
export class TrackingService implements OnModuleInit {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectRepository(DriverLocation)
    private readonly driverLocationRepo: Repository<DriverLocation>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultDriver();
  }

  private async seedDefaultDriver() {
    try {
      const count = await this.driverLocationRepo.count();
      if (count === 0) {
        this.logger.log('Inicializando registro de telemetría de conductor por defecto...');
        const initial = this.driverLocationRepo.create({
          driver_id: 'drv-carlos-mendoza-01',
          driver_name: 'Carlos Mendoza',
          order_id: 'ORD-8492',
          latitude: 6.208571,
          longitude: -75.568434,
          heading: 85.0,
          speed_kmh: 24.5,
          accuracy: 3.5,
          is_online: true,
          status: 'EN_CAMINO',
        });
        await this.driverLocationRepo.save(initial);
        this.logger.log('✅ Telemetría inicial de conductor configurada exitosamente.');
      }
    } catch (e) {
      this.logger.warn(`Error en seed de telemetría inicial: ${e.message}`);
    }
  }

  async updateLocation(dto: UpdateDriverLocationDto): Promise<DriverLocation> {
    const driverId = dto.driver_id || 'drv-carlos-mendoza-01';
    const orderId = dto.order_id || 'ORD-8492';

    // Buscar si ya existe registro para este conductor o pedido
    let record = await this.driverLocationRepo.findOne({
      where: [
        { driver_id: driverId },
        { order_id: orderId },
      ],
      order: { updated_at: 'DESC' },
    });

    if (!record) {
      record = this.driverLocationRepo.create({
        driver_id: driverId,
        driver_name: dto.driver_name || 'Carlos Mendoza',
        order_id: orderId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        heading: dto.heading ?? 0.0,
        speed_kmh: dto.speed_kmh ?? 0.0,
        accuracy: dto.accuracy ?? 5.0,
        is_online: dto.is_online !== undefined ? dto.is_online : true,
        status: dto.status || 'EN_CAMINO',
      });
    } else {
      record.latitude = dto.latitude;
      record.longitude = dto.longitude;
      if (dto.driver_name) record.driver_name = dto.driver_name;
      if (dto.order_id) record.order_id = dto.order_id;
      if (dto.heading !== undefined) record.heading = dto.heading;
      if (dto.speed_kmh !== undefined) record.speed_kmh = dto.speed_kmh;
      if (dto.accuracy !== undefined) record.accuracy = dto.accuracy;
      if (dto.is_online !== undefined) record.is_online = dto.is_online;
      if (dto.status) record.status = dto.status;
      record.updated_at = new Date();
    }

    const saved = await this.driverLocationRepo.save(record);
    this.logger.log(`🛰️ GPS de conductor "${saved.driver_name}" actualizado: [${saved.latitude}, ${saved.longitude}] (Velocidad: ${saved.speed_kmh} km/h)`);
    return saved;
  }

  async getLatestLocation(identifier?: string): Promise<DriverLocation | null> {
    if (!identifier) {
      // Retorna el registro más reciente en general
      return this.driverLocationRepo.findOne({
        order: { updated_at: 'DESC' },
      });
    }

    // Búsqueda por order_id, driver_id o id
    const found = await this.driverLocationRepo.findOne({
      where: [
        { order_id: identifier },
        { driver_id: identifier },
      ],
      order: { updated_at: 'DESC' },
    });

    if (found) return found;

    // Fallback al más reciente
    return this.driverLocationRepo.findOne({
      order: { updated_at: 'DESC' },
    });
  }

  async getActiveDrivers(): Promise<DriverLocation[]> {
    return this.driverLocationRepo.find({
      where: { is_online: true },
      order: { updated_at: 'DESC' },
    });
  }

  async toggleDriverStatus(driverId: string, isOnline: boolean): Promise<DriverLocation | null> {
    const record = await this.driverLocationRepo.findOne({
      where: { driver_id: driverId },
      order: { updated_at: 'DESC' },
    });
    if (!record) return null;
    record.is_online = isOnline;
    record.status = isOnline ? 'EN_CAMINO' : 'DESCONECTADO';
    record.updated_at = new Date();
    return this.driverLocationRepo.save(record);
  }
}
