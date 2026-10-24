import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  /**
   * Endpoint utilizado por la App de Conductor para emitir su ubicación GPS en tiempo real.
   */
  @Post('driver-location')
  @HttpCode(HttpStatus.OK)
  async updateDriverLocation(@Body() dto: UpdateDriverLocationDto) {
    const updated = await this.trackingService.updateLocation(dto);
    return {
      status: 'success',
      message: 'Ubicación GPS registrada exitosamente',
      data: updated,
    };
  }

  /**
   * Endpoint utilizado por la App de Pasajeros para consultar la posición actual del conductor de su pedido.
   */
  @Get('driver-location/:identifier')
  async getDriverLocation(@Param('identifier') identifier: string) {
    const location = await this.trackingService.getLatestLocation(identifier);
    return {
      status: 'success',
      data: location,
    };
  }

  @Get('driver-location')
  async getLatestDriverLocation() {
    const location = await this.trackingService.getLatestLocation();
    return {
      status: 'success',
      data: location,
    };
  }

  /**
   * Lista de conductores activos para el panel admin y monitor de despacho.
   */
  @Get('active-drivers')
  async getActiveDrivers() {
    const drivers = await this.trackingService.getActiveDrivers();
    return {
      status: 'success',
      total: drivers.length,
      data: drivers,
    };
  }

  @Patch('driver-status')
  async toggleDriverStatus(@Body() body: { driver_id: string; is_online: boolean }) {
    const updated = await this.trackingService.toggleDriverStatus(body.driver_id, body.is_online);
    return {
      status: 'success',
      data: updated,
    };
  }
}
