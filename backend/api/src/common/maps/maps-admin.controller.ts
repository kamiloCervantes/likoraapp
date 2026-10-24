import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MapsService } from './maps.service';
import { MapsConfig } from './entities/maps-config.entity';

@Controller('admin/maps')
export class MapsAdminController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('config')
  async getConfig() {
    const config = await this.mapsService.getConfig();
    return {
      status: 'success',
      data: config,
    };
  }

  @Put('config')
  async updateConfig(@Body() dto: Partial<MapsConfig>) {
    const updated = await this.mapsService.updateConfig(dto);
    return {
      status: 'success',
      message: 'Configuración de Google Maps API actualizada exitosamente',
      data: updated,
    };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body('api_key') apiKey?: string) {
    const result = await this.mapsService.testApiKey(apiKey);
    return {
      status: result.success ? 'success' : 'error',
      ...result,
    };
  }
}
