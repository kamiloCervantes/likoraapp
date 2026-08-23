import { randomUUID } from 'crypto';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, Not } from 'typeorm';
import { IdentityVerification } from './entities/identity-verification.entity';
import { User } from '../users/entities/user.entity';
import { KycStatus } from '../common/enums/kyc-status.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { RequestKycUploadDto } from './dto/request-kyc-upload.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { RejectKycDto } from './dto/reject-kyc.dto';
import { KycStatusResponseDto } from './dto/kyc-status-response.dto';
import { KycDetailResponseDto } from './dto/kyc-detail-response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CryptoService } from '../common/crypto/crypto.service';
import { StorageService } from '../common/storage/storage.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly minimumLegalAge = 18;
  private readonly verificationValidityHours = 1; // 1 hora de vigencia configurable

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

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async requestUploadUrls(userId: string, dto: RequestKycUploadDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.status === UserStatus.BLOCKED_UNDERAGE) {
      throw new ForbiddenException('Usuario bloqueado por minoría de edad.');
    }

    const verificationSessionId = randomUUID();

    const frontKey = this.storageService.generateKycKey(userId, verificationSessionId, 'front');
    const selfieKey = this.storageService.generateKycKey(userId, verificationSessionId, 'selfie');

    const frontPresigned = await this.storageService.getPresignedUploadUrl(frontKey);
    const selfiePresigned = await this.storageService.getPresignedUploadUrl(selfieKey);

    let backPresigned = null;
    if (dto.has_back_image) {
      const backKey = this.storageService.generateKycKey(userId, verificationSessionId, 'back');
      backPresigned = await this.storageService.getPresignedUploadUrl(backKey);
    }

    return {
      verification_session_id: verificationSessionId,
      upload_urls: {
        front: frontPresigned,
        back: backPresigned,
        selfie: selfiePresigned,
      },
      expires_in_seconds: 300,
    };
  }

  async submitVerification(userId: string, dto: SubmitKycDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['identity_verifications'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.status === UserStatus.BLOCKED_UNDERAGE) {
      throw new ForbiddenException('Usuario bloqueado permanentemente por minoría de edad.');
    }

    // 1. Validar mayoría de edad legal (+18)
    const birthDate = new Date(dto.extracted_birth_date);
    const age = this.calculateAge(birthDate);

    if (age < this.minimumLegalAge) {
      user.status = UserStatus.BLOCKED_UNDERAGE;
      user.kyc_status = KycStatus.REJECTED;
      user.birth_date = birthDate;
      await this.userRepository.save(user);

      throw new ForbiddenException({
        statusCode: 403,
        errorCode: 'UNDERAGE_DETECTED',
        message: 'No cumples con la mayoría de edad legal (18 años) para comprar bebidas alcohólicas.',
        calculatedAge: age,
      });
    }

    // 2. Comprobar si tiene una verificación VIGENTE activa (menos de 1 hora)
    const now = new Date();
    const activeVerification = user.identity_verifications?.find(
      (v) => v.status === KycStatus.VERIFIED && v.expires_at && v.expires_at > now,
    );

    if (activeVerification) {
      return {
        id: activeVerification.id,
        status: KycStatus.VERIFIED,
        message: `Ya cuentas con una verificación activa vigente hasta ${activeVerification.expires_at.toISOString()}`,
        expires_at: activeVerification.expires_at,
      };
    }

    // 3. Hash del documento para prevención de fraude entre diferentes usuarios
    const docHash = this.cryptoService.hashDocumentNumber(dto.document_number);
    const existingOtherUser = await this.kycRepository.findOne({
      where: { document_number_hash: docHash, status: KycStatus.VERIFIED },
    });

    if (existingOtherUser && existingOtherUser.user_id !== userId && (!existingOtherUser.expires_at || existingOtherUser.expires_at > now)) {
      throw new ConflictException('Este documento de identidad ya se encuentra verificado en otra cuenta activa.');
    }

    // 4. Cifrado simétrico AES-256-GCM del documento (PII)
    const docEncrypted = this.cryptoService.encryptDocumentNumber(dto.document_number);

    // 5. Transacción atómica en Base de Datos
    return await this.dataSource.transaction(async (manager) => {
      const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(dto.verification_session_id || '');
      const verification = manager.create(IdentityVerification, {
        id: isValidId ? dto.verification_session_id : undefined,
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

      const saved = await manager.save(IdentityVerification, verification);

      await manager.update(User, { id: userId }, {
        kyc_status: KycStatus.PENDING_REVIEW,
        birth_date: birthDate,
      });

      return saved;
    });
  }

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

    const now = new Date();
    const isExpired = lastVerification?.expires_at ? lastVerification.expires_at <= now : false;
    const isCurrentlyVerified = user.kyc_status === KycStatus.VERIFIED && !isExpired;

    return {
      user_id: user.id,
      kyc_status: isCurrentlyVerified ? KycStatus.VERIFIED : (isExpired ? KycStatus.NOT_STARTED : user.kyc_status),
      is_adult: user.isAdult,
      can_purchase_alcohol: isCurrentlyVerified,
      last_verification: lastVerification
        ? {
            id: lastVerification.id,
            document_type: lastVerification.document_type,
            status: isExpired && lastVerification.status === KycStatus.VERIFIED ? KycStatus.NOT_STARTED : lastVerification.status,
            rejection_reason: lastVerification.rejection_reason,
            submitted_at: lastVerification.created_at,
            verified_at: lastVerification.verified_at,
            expires_at: lastVerification.expires_at,
          }
        : null,
    };
  }

  /**
   * Backoffice: Listado con filtro de estado (PENDING_REVIEW, VERIFIED, REJECTED, ALL)
   */
  async getVerifications(status?: string, paginationDto?: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status as KycStatus;
    }

    const [items, total] = await this.kycRepository.findAndCount({
      where,
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: items.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        user_display_name: item.user?.display_name || 'Usuario',
        user_email: item.user?.email || 'Sin correo',
        document_type: item.document_type,
        extracted_birth_date: item.extracted_birth_date,
        calculated_age: this.calculateAge(new Date(item.extracted_birth_date)),
        status: item.status,
        rejection_reason: item.rejection_reason,
        verified_at: item.verified_at,
        expires_at: item.expires_at,
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

  async getPendingVerifications(paginationDto: PaginationDto) {
    return this.getVerifications(KycStatus.PENDING_REVIEW, paginationDto);
  }

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
        id: verification.user?.id,
        display_name: verification.user?.display_name,
        email: verification.user?.email,
        phone_number: verification.user?.phone_number,
        birth_date: verification.user?.birth_date,
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

  async approveVerification(verificationId: string, adminUserId: string) {
    const verification = await this.kycRepository.findOne({
      where: { id: verificationId },
      relations: ['user'],
    });

    if (!verification) {
      throw new NotFoundException('Verificación no encontrada');
    }

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.verificationValidityHours); // 1 hora de vigencia

    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(adminUserId || '');

    await this.dataSource.transaction(async (manager) => {
      verification.status = KycStatus.VERIFIED;
      verification.reviewed_by_user_id = isValidUuid ? adminUserId : null;
      verification.verified_at = now;
      verification.expires_at = expiresAt;
      verification.rejection_reason = null;

      await manager.save(IdentityVerification, verification);

      await manager.update(User, { id: verification.user_id }, {
        kyc_status: KycStatus.VERIFIED,
        birth_date: verification.extracted_birth_date,
      });
    });

await this.redisService.set(
      `kyc_event:${verification.user_id}`,
      JSON.stringify({ event: 'kyc.approved', userId: verification.user_id, expires_at: expiresAt.toISOString(), timestamp: now.toISOString() }),
      60 * 60,
    );

    return {
      success: true,
      message: `Verificación KYC aprobada exitosamente con vigencia de 1 hora (Hasta: ${expiresAt.toLocaleTimeString()}).`,
      status: KycStatus.VERIFIED,
      expires_at: expiresAt,
    };
  }

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

    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(adminUserId || '');

    await this.dataSource.transaction(async (manager) => {
      verification.status = KycStatus.REJECTED;
      verification.reviewed_by_user_id = isValidUuid ? adminUserId : null;
      verification.rejection_reason = fullReason;
      verification.verified_at = null;
      verification.expires_at = null;

      await manager.save(IdentityVerification, verification);

      await manager.update(User, { id: verification.user_id }, {
        kyc_status: KycStatus.REJECTED,
      });
    });

    await this.redisService.set(
      `kyc_event:${verification.user_id}`,
      JSON.stringify({ event: 'kyc.rejected', userId: verification.user_id, reason: fullReason }),
      60 * 60,
    );

    return {
      success: true,
      message: 'Verificación KYC marcada como RECHAZADA.',
      status: KycStatus.REJECTED,
      rejection_reason: fullReason,
    };
  }
}
