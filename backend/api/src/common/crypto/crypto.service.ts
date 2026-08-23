import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;
  private readonly hashPepper: string;

  constructor(private readonly configService: ConfigService) {
    const rawKey = this.configService.get<string>(
      'PII_ENCRYPTION_KEY',
      'likora_32_bytes_pii_secret_key_2026_aes_gcm!',
    );
    // Asegurar 32 bytes para AES-256
    this.encryptionKey = crypto.createHash('sha256').update(rawKey).digest();
    this.hashPepper = this.configService.get<string>('PII_HASH_PEPPER', 'likora_doc_pepper_2026');
  }

  /**
   * Hash criptográfico SHA-256 con Pepper para indexación y búsqueda rápida de documentos
   * Evita que el mismo documento se use en múltiples cuentas
   */
  hashDocumentNumber(docNumber: string): string {
    const normalized = docNumber.trim().toUpperCase();
    return crypto
      .createHash('sha256')
      .update(`${normalized}:${this.hashPepper}`)
      .digest('hex');
  }

  /**
   * Cifrado simétrico AES-256-GCM para números de documento (PII en reposo)
   * Retorna formato: ivHex:authTagHex:encryptedHex
   */
  encryptDocumentNumber(docNumber: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

    let encrypted = cipher.update(docNumber.trim().toUpperCase(), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Descifrado simétrico AES-256-GCM para auditoría de documentos
   */
  decryptDocumentNumber(encryptedPayload: string): string {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de carga cifrada inválido');
    }

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
