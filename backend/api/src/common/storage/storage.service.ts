import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageConfig, StorageProvider } from './entities/storage-config.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private currentConfig: StorageConfig | null = null;
  private readonly uploadsDir: string;

  constructor(
    @InjectRepository(StorageConfig)
    private readonly storageConfigRepo: Repository<StorageConfig>,
  ) {
    this.uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async onModuleInit() {
    await this.reloadActiveConfig();
  }

  async reloadActiveConfig(): Promise<StorageConfig | null> {
    try {
      const active = await this.storageConfigRepo.findOne({
        where: { is_active: true },
        order: { updated_at: 'DESC' },
      });

      if (active && active.provider !== StorageProvider.LOCAL && active.access_key_id && active.secret_access_key) {
        let endpoint = active.endpoint;
        let region = active.region || 'us-east-1';

        if (active.provider === StorageProvider.CLOUDFLARE_R2) {
          region = 'auto';
        }

        this.s3Client = new S3Client({
          region,
          credentials: {
            accessKeyId: active.access_key_id,
            secretAccessKey: active.secret_access_key,
          },
          endpoint: endpoint || undefined,
          forcePathStyle: active.provider === StorageProvider.MINIO,
        });
        this.currentConfig = active;
        this.logger.log(`[StorageService] Proveedor activo configurado: ${active.provider} (Bucket: ${active.bucket_name})`);
      } else {
        this.s3Client = null;
        this.currentConfig = active || null;
        this.logger.log(`[StorageService] Almacenamiento LOCAL activo (Guardando en ${this.uploadsDir})`);
      }
      return this.currentConfig;
    } catch (e) {
      this.logger.warn(`[StorageService] Error al cargar configuración de storage: ${e}. Usando LOCAL.`);
      this.s3Client = null;
      return null;
    }
  }

  async getActiveConfig(): Promise<StorageConfig | null> {
    if (!this.currentConfig) {
      await this.reloadActiveConfig();
    }
    return this.currentConfig;
  }

  async testConnection(config: Partial<StorageConfig>): Promise<{ success: boolean; message: string }> {
    if (config.provider === StorageProvider.LOCAL || !config.provider) {
      return { success: true, message: 'Almacenamiento Local verificado y listo en el servidor.' };
    }

    try {
      let region = config.region || 'us-east-1';
      if (config.provider === StorageProvider.CLOUDFLARE_R2) {
        region = 'auto';
      }

      const client = new S3Client({
        region,
        credentials: {
          accessKeyId: config.access_key_id || '',
          secretAccessKey: config.secret_access_key || '',
        },
        endpoint: config.endpoint || undefined,
        forcePathStyle: config.provider === StorageProvider.MINIO,
      });

      const command = new ListObjectsV2Command({
        Bucket: config.bucket_name || '',
        MaxKeys: 1,
      });

      await client.send(command);
      return { success: true, message: `Conexión exitosa con ${config.provider}! Bucket verificado correctamente.` };
    } catch (e: any) {
      this.logger.error(`[StorageService] Error en test de conexión: ${e.message}`);
      return { success: false, message: `Fallo de conexión: ${e.message || e}` };
    }
  }

  async saveConfig(dto: Partial<StorageConfig>): Promise<StorageConfig> {
    // Desactivar configs previas
    await this.storageConfigRepo.update({}, { is_active: false });

    let config = await this.storageConfigRepo.findOne({ where: { provider: dto.provider } });
    if (!config) {
      config = this.storageConfigRepo.create(dto);
    } else {
      Object.assign(config, dto);
    }
    config.is_active = true;

    const saved = await this.storageConfigRepo.save(config);
    await this.reloadActiveConfig();
    return saved;
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string = 'image/jpeg',
    expiresInSeconds: number = 300,
  ): Promise<{ uploadUrl: string; key: string }> {
    if (this.s3Client && this.currentConfig && this.currentConfig.provider !== StorageProvider.LOCAL) {
      const command = new PutObjectCommand({
        Bucket: this.currentConfig.bucket_name,
        Key: key,
        ContentType: contentType,
      });
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
      return { uploadUrl, key };
    }

    // Local
    const localUploadUrl = `http://localhost:3000/api/v1/storage/upload?key=${encodeURIComponent(key)}`;
    return { uploadUrl: localUploadUrl, key };
  }

  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds: number = 300,
  ): Promise<string> {
    if (this.s3Client && this.currentConfig && this.currentConfig.provider !== StorageProvider.LOCAL) {
      if (this.currentConfig.custom_domain) {
        return `${this.currentConfig.custom_domain.replace(/\/$/, '')}/${key}`;
      }

      const command = new GetObjectCommand({
        Bucket: this.currentConfig.bucket_name,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    }

    // Local
    return `http://localhost:3000/api/v1/storage/view?key=${encodeURIComponent(key)}`;
  }

  saveLocalFile(key: string, buffer: Buffer): string {
    const safeKey = key.replace(/\.\./g, '');
    const targetPath = path.join(this.uploadsDir, safeKey);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, buffer);
    this.logger.log(`[StorageService] Archivo guardado localmente: ${targetPath} (${buffer.length} bytes)`);
    return targetPath;
  }

  getLocalFilePath(key: string): string | null {
    const safeKey = key.replace(/\.\./g, '');
    const targetPath = path.join(this.uploadsDir, safeKey);
    if (fs.existsSync(targetPath)) {
      return targetPath;
    }
    return null;
  }

  generateKycKey(
    userId: string,
    verificationId: string,
    imageType: 'front' | 'back' | 'selfie',
    extension: string = 'jpg',
  ): string {
    return `kyc-documents/${userId}/${verificationId}/${imageType}.${extension}`;
  }
}
