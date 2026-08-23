import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly isMockStorage: boolean;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'likora-kyc-documents');
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY', '');
    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT', undefined);

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        endpoint: endpoint || undefined,
        forcePathStyle: !!endpoint, // Requerido para MinIO local
      });
      this.isMockStorage = false;
      this.logger.log(`[StorageService] AWS S3 / MinIO configurado en bucket: ${this.bucketName}`);
    } else {
      this.isMockStorage = true;
      this.logger.warn('[StorageService] Credenciales S3 no configuradas. Operando con simulador de URLs prefirmadas para desarrollo.');
    }
  }

  /**
   * Genera URL prefirmada PUT para subida directa desde apps móviles o web
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string = 'image/jpeg',
    expiresInSeconds: number = 300,
  ): Promise<{ uploadUrl: string; key: string }> {
    if (!this.isMockStorage && this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
      return { uploadUrl, key };
    }

    // Mock para desarrollo local
    const mockUploadUrl = `https://${this.bucketName}.s3.amazonaws.com/${key}?mock_signature=dev_upload_token_${Date.now()}`;
    return { uploadUrl: mockUploadUrl, key };
  }

  /**
   * Genera URL prefirmada GET para lectura segura temporal (5 min) por administradores
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds: number = 300,
  ): Promise<string> {
    if (!this.isMockStorage && this.s3Client) {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    }

    // Mock para desarrollo local
    return `https://${this.bucketName}.s3.amazonaws.com/${key}?mock_view_token_${Date.now()}`;
  }

  /**
   * Genera ruta estándar organizada en S3
   */
  generateKycKey(
    userId: string,
    verificationId: string,
    imageType: 'front' | 'back' | 'selfie',
    extension: string = 'jpg',
  ): string {
    return `kyc-documents/${userId}/${verificationId}/${imageType}.${extension}`;
  }
}
