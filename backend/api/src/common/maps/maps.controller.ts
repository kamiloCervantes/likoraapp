import { Controller, Get } from '@nestjs/common';
import { MapsService } from './maps.service';

@Controller('config/maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get()
  async getPublicConfig() {
    const config = await this.mapsService.getPublicClientConfig();
    return {
      status: 'success',
      data: config,
    };
  }
}
