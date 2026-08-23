import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';

import { IdentityVerification } from './entities/identity-verification.entity';
import { User } from '../users/entities/user.entity';
import { StorageService } from '../common/storage/storage.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { RedisService } from '../redis/redis.service';

import { RequestKycUploadDto } from './dto/request-kyc-upload.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { RejectKycDto } from './dto/reject-kyc.dto';
import { PaginationDto } from './dto/pagination.dto';
import { KycStatusResponseDto } from './dto/kyc-status-response.dto';
import { KycDetailResponseDto } from './dto/kyc-detail-response.dto';

import { KycStatus } from '../common/enums/kyc-status.enum';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly minimumLegalAge = 18;

  constructor(
    @InjectRepository(IdentityVerification)
    private readonly kycRepository: Repository<IdentityVerification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly storageService: StorageService,
    private readonly cryptoService: CryptoService,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Calcula la edad en años a partir de una fecha de nacimiento
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Paso 1: Consumidor solicita URLs prefirmadas para carga directa de documentos
   */
  async requestUploadUrls(userId: string, dto: RequestKycUploadDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.kyc_status === KycStatus.VERIFIED) {
      throw new BadRequestException('Su identidad ya se encuentra validada y aprobada.');
    }

    const verificationSessionId = crypto.randomUUID();

    const frontKey = this.storageService.generateKycKey(userId, verificationSessionId, 'front');
    const selfieKey = this.storageService.generateKycKey(userId, verificationSessionId, 'selfie');
    const backKey = dto.has_back_image
      ? this.storageService.generateKycKey(userId, verificationSessionId, 'back')
      : null;

    const frontUpload = await this.storageService.getPresignedUploadUrl(frontKey);
    const selfieUpload = await this.storageService.getPresignedUploadUrl(selfieKey);
    const backUpload = backKey
      ? await this.storageService.getPresignedUploadUrl(backKey)
      : null;

    return {
      verification_session_id: verificationSessionId,
      expires_in_seconds: 300,
      upload_urls: {
        front: frontUpload,
        back: backUpload,
        selfie: selfieUpload,
      },
    };
  }

  /**
   * Paso 2: Consumidor envía datos extraídos del documento para validación y revisión
   */
  async submitVerification(userId: string, dto: SubmitKycDto): Promise<IdentityVerification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 1. Validar estado actual
    if (user.kyc_status === KycStatus.VERIFIED) {
      throw new BadRequestException('El usuario ya cuenta con verificación de identidad aprobada.');
    }

    if (user.status === UserStatus.BLOCKED_UNDERAGE) {
      throw new ForbiddenException(
        'Acceso bloqueado: Usuario identificado previamente como menor de edad legal.',
      );
    }

    // 2. Validación Automática de Mayoría de Edad (+18)
    const birthDate = new Date(dto.extracted_birth_date);
    const age = this.calculateAge(birthDate);

    if (age < this.minimumLegalAge) {
      // Bloqueo estricto por minoría de edad
      user.status = UserStatus.BLOCKED_UNDERAGE;
      user.kyc_status = KycStatus.REJECTED;
      user.birth_date = birthDate;
      await this.userRepository.save(user);

      this.logger.warn(`[KYC Compliance] Usuario ${userId} bloqueado por ser menor de edad (${age} años).`);

      throw new ForbiddenException({
        statusCode: 403,
        errorCode: 'UNDERAGE_FORBIDDEN',
        message: `No cumple con la mayoría de edad legal requerida (${this.minimumLegalAge}+ años) para comprar bebidas alcohólicas.`,
        ageDetected: age,
      });
    }

    // 3. Prevención de Cuentas Duplicadas con el mismo Documento
    const docHash = this.cryptoService.hashDocumentNumber(dto.document_number);
    const existingApproved = await this.kycRepository.findOne({
      where: { document_number_hash: docHash, status: KycStatus.VERIFIED },
    });

    if (existingApproved && existingApproved.user_id !== userId) {
      throw new ConflictException(
        'Este documento de identidad ya se encuentra registrado y verificado en otra cuenta.',
      );
    }

    // 4. Cifrado simétrico AES-256-GCM del documento (PII en reposo)
    const docEncrypted = this.cryptoService.encryptDocumentNumber(dto.document_number);

    // 5. Transacción atómica en Base de Datos
    return await this.dataSource.transaction(async (manager) => {
      const verification = manager.create(IdentityVerification, {
        id: dto.verification_session_id || undefined,
        user_id: userId,
        document_type: dto.document_type,
        document_number_hash: docHash,
        document_number_enc: docEncrypted,
        extracted_birth_date: birthDate,
        front_image_path: dto.front_image_key,
        back_image_path: dto.back_image_key || null,
        selfie_image_path: dto.selfie_image_key,
        status: KycStatus.PENDING_REVIEW,
      });

      const saved = await manager.save(verification);

      user.kyc_status = KycStatus.PENDING_REVIEW;
      user.birth_date = birthDate;
      await manager.save(user);

      return saved;
    });
  }

  /**
   * Consulta del estado de verificación del usuario actual
   */
  async getMyKycStatus(userId: string): Promise<KycStatusResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['identity_verifications'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const lastVerification = user.identity_verifications?.length
      ? user.identity_verifications.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0]
      : null;

    return {
      user_id: user.id,
      kyc_status: user.kyc_status,
      is_adult: user.isAdult,
      can_purchase_alcohol: user.kyc_status === KycStatus.VERIFIED,
      last_verification: lastVerification
        ? {
            id: lastVerification.id,
            document_type: lastVerification.document_type,
            status: lastVerification.status,
            rejection_reason: lastVerification.rejection_reason,
            submitted_at: lastVerification.created_at,
            verified_at: lastVerification.verified_at,
            expires_at: lastVerification.expires_at,
          }
        : null,
    };
  }

  /**
   * Backoffice: Lista de verificaciones pendientes de auditoría
   */
  async getPendingVerifications(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, total] = await this.kycRepository.findAndCount({
      where: { status: KycStatus.PENDING_REVIEW },
      relations: ['user'],
      order: { created_at: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: items.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        user_display_name: item.user?.display_name,
        user_email: item.user?.email,
        document_type: item.document_type,
        extracted_birth_date: item.extracted_birth_date,
        calculated_age: this.calculateAge(new Date(item.extracted_birth_date)),
        status: item.status,
        submitted_at: item.created_at,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Backoffice: Detalle completo de una verificación con URLs prefirmadas de imágenes
   */
  async getVerificationDetail(verificationId: string): Promise<KycDetailResponseDto> {
    const verification = await this.kycRepository.findOne({
      where: { id: verificationId },
      relations: ['user'],
    });

    if (!verification) {
      throw new NotFoundException('Verificación no encontrada');
    }

    let decryptedDoc = '***';
    if (verification.document_number_enc) {
      try {
        decryptedDoc = this.cryptoService.decryptDocumentNumber(verification.document_number_enc);
      } catch (e) {
        decryptedDoc = 'Error al descifrar documento';
      }
    }

    const frontUrl = await this.storageService.getPresignedDownloadUrl(verification.front_image_path);
    const selfieUrl = await this.storageService.getPresignedDownloadUrl(verification.selfie_image_path);
    const backUrl = verification.back_image_path
      ? await this.storageService.getPresignedDownloadUrl(verification.back_image_path)
      : null;

    const birthDate = new Date(verification.extracted_birth_date);
    const age = this.calculateAge(birthDate);

    return {
      id: verification.id,
      user: {
        id: verification.user.id,
        display_name: verification.user.display_name,
        email: verification.user.email,
        phone_number: verification.user.phone_number,
        birth_date: verification.user.birth_date,
      },
      document_type: verification.document_type,
      decrypted_document_number: decryptedDoc,
      extracted_birth_date: verification.extracted_birth_date,
      calculated_age: age,
      is_legal_age: age >= this.minimumLegalAge,
      front_image_url: frontUrl,
      back_image_url: backUrl,
      selfie_image_url: selfieUrl,
      status: verification.status,
      rejection_reason: verification.rejection_reason,
      reviewed_by_user_id: verification.reviewed_by_user_id,
      verified_at: verification.verified_at,
      expires_at: verification.expires_at,
      created_at: verification.created_at,
    };
  }

  /**
   * Backoffice: Aprobar verificación KYC
   */
  async approveVerification(verificationId: string, adminUserId: string) {
    const verification = await this.kycRepository.findOne({
      where: { id: verificationId },
      relations: ['user'],
    });

    if (!verification) {
      throw new NotFoundException('Verificación no encontrada');
    }

    if (verification.status === KycStatus.VERIFIED) {
      throw new BadRequestException('Esta verificación ya ha sido aprobada previamente.');
    }

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 3); // Vigencia de 3 años

    await this.dataSource.transaction(async (manager) => {
      verification.status = KycStatus.VERIFIED;
      verification.reviewed_by_user_id = adminUserId;
      verification.verified_at = now;
      verification.expires_at = expiresAt;
      verification.rejection_reason = null;

      await manager.save(verification);

      verification.user.kyc_status = KycStatus.VERIFIED;
      verification.user.birth_date = verification.extracted_birth_date;
      await manager.save(verification.user);
    });

    // Publicar evento en Redis para notificar a la app móvil en tiempo real
    await this.redisService.set(
      `kyc_event:${verification.user_id}`,
      JSON.stringify({ event: 'kyc.approved', userId: verification.user_id, timestamp: now.toISOString() }),
      60 * 60,
    );

    return {
      success: true,
      message: 'Verificación KYC aprobada exitosamente. El usuario ya puede realizar compras de licores.',
      status: KycStatus.VERIFIED,
    };
  }

  /**
   * Backoffice: Rechazar verificación KYC
   */
  async rejectVerification(verificationId: string, adminUserId: string, dto: RejectKycDto) {
    const verification = await this.kycRepository.findOne({
      where: { id: verificationId },
      relations: ['user'],
    });

    if (!verification) {
      throw new NotFoundException('Verificación no encontrada');
    }

    const fullReason = dto.custom_notes
      ? `${dto.reason}: ${dto.custom_notes}`
      : dto.reason;

    await this.dataSource.transaction(async (manager) => {
      verification.status = KycStatus.REJECTED;
      verification.reviewed_by_user_id = adminUserId;
      verification.rejection_reason = fullReason;

      await manager.save(verification);

      verification.user.kyc_status = KycStatus.REJECTED;
      await manager.save(verification.user);
    });

    // Publicar evento en Redis
    await this.redisService.set(
      `kyc_event:${verification.user_id}`,
      JSON.stringify({ event: 'kyc.rejected', userId: verification.user_id, reason: fullReason }),
      60 * 60,
    );

    return {
      success: true,
      message: 'Verificación KYC rechazada.',
      status: KycStatus.REJECTED,
      rejection_reason: fullReason,
    };
  }
}
