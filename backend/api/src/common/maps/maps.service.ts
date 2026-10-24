import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapsConfig } from './entities/maps-config.entity';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);

  constructor(
    @InjectRepository(MapsConfig)
    private readonly mapsConfigRepository: Repository<MapsConfig>,
  ) {}

  async getConfig(): Promise<MapsConfig> {
    let config = await this.mapsConfigRepository.findOne({
      where: { is_active: true },
      order: { updated_at: 'DESC' },
    });

    if (!config) {
      config = this.mapsConfigRepository.create({
        api_key_web: process.env.GOOGLE_MAPS_API_KEY_WEB || 'AIzaSyB_LikoraWebMapsKeyDemo2026',
        api_key_android: process.env.GOOGLE_MAPS_API_KEY_ANDROID || 'AIzaSyB_LikoraAndroidKeyDemo2026',
        api_key_ios: process.env.GOOGLE_MAPS_API_KEY_IOS || 'AIzaSyB_LikoraIosKeyDemo2026',
        api_key_server: process.env.GOOGLE_MAPS_API_KEY_SERVER || 'AIzaSyB_LikoraServerKeyDemo2026',
        is_live_tracking_enabled: true,
        is_directions_enabled: true,
        gps_update_interval_sec: 5,
        default_center_lat: 6.2085710,
        default_center_lng: -75.5684340,
        is_active: true,
      });
      config = await this.mapsConfigRepository.save(config);
    }

    return config;
  }

  async updateConfig(dto: Partial<MapsConfig>): Promise<MapsConfig> {
    const current = await this.getConfig();

    const updated = this.mapsConfigRepository.merge(current, {
      ...dto,
      default_center_lat: dto.default_center_lat ? Number(dto.default_center_lat) : current.default_center_lat,
      default_center_lng: dto.default_center_lng ? Number(dto.default_center_lng) : current.default_center_lng,
      gps_update_interval_sec: dto.gps_update_interval_sec ? Number(dto.gps_update_interval_sec) : current.gps_update_interval_sec,
    });

    const saved = await this.mapsConfigRepository.save(updated);
    this.logger.log(`Google Maps API configuration updated successfully: ${saved.id}`);
    return saved;
  }

  async getPublicClientConfig() {
    const config = await this.getConfig();
    return {
      api_key_web: config.api_key_web,
      api_key_android: config.api_key_android,
      api_key_ios: config.api_key_ios,
      is_live_tracking_enabled: config.is_live_tracking_enabled,
      is_directions_enabled: config.is_directions_enabled,
      gps_update_interval_sec: config.gps_update_interval_sec,
      default_center: {
        latitude: Number(config.default_center_lat),
        longitude: Number(config.default_center_lng),
      },
    };
  }

  async testApiKey(apiKey?: string): Promise<{ success: boolean; message: string; details?: any }> {
    const key = apiKey || (await this.getConfig()).api_key_server || (await this.getConfig()).api_key_web;

    if (!key || key.trim().length === 0) {
      return {
        success: false,
        message: 'No se ha configurado ninguna Google Maps API Key para probar.',
      };
    }

    try {
      // Test using Google Geocoding API test probe
      const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=6.208571,-75.568434&key=${key}`;
      const res = await fetch(testUrl);
      const data = await res.json();

      if (data.status === 'OK') {
        return {
          success: true,
          message: 'Conexión exitosa con Google Maps API. Clave verificada y autorizada.',
          details: { status: data.status, results_count: data.results?.length || 0 },
        };
      } else if (data.status === 'REQUEST_DENIED') {
        return {
          success: false,
          message: `Google Maps API denegó la petición: ${data.error_message || 'Clave no autorizada o servicios requeridos no habilitados en Google Cloud Console'}`,
          details: { status: data.status, error_message: data.error_message },
        };
      } else {
        return {
          success: true,
          message: `API respondió con código: ${data.status}. Clave sintácticamente válida.`,
          details: data,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: `Error de red al conectar con Google Maps: ${e.message}`,
      };
    }
  }
}
