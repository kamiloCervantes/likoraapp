import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageConfig, StorageProvider } from './entities/storage-config.entity';

@Controller('admin/storage')
export class StorageAdminController {
  constructor(private readonly storageService: StorageService) {}

  @Get('config')
  async getConfig() {
    const config = await this.storageService.getActiveConfig();
    if (!config) {
      return {
        provider: StorageProvider.LOCAL,
        bucket_name: '',
        region: 'us-east-1',
        endpoint: '',
        access_key_id: '',
        custom_domain: '',
        is_active: true,
      };
    }

    return {
      id: config.id,
      provider: config.provider,
      bucket_name: config.bucket_name,
      region: config.region,
      endpoint: config.endpoint,
      access_key_id: config.access_key_id,
      custom_domain: config.custom_domain,
      is_active: config.is_active,
      has_secret: !!config.secret_access_key,
    };
  }

  @Post('test-connection')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body() dto: Partial<StorageConfig>) {
    return this.storageService.testConnection(dto);
  }

  @Put('config')
  @HttpCode(HttpStatus.OK)
  async updateConfig(@Body() dto: Partial<StorageConfig>) {
    const saved = await this.storageService.saveConfig(dto);
    return {
      success: true,
      message: `Configuración guardada y proveedor ${saved.provider} activado con éxito!`,
      data: saved,
    };
  }
}
