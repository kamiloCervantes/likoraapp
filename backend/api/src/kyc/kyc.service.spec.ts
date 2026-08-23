import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { KycService } from './kyc.service';
import { IdentityVerification } from './entities/identity-verification.entity';
import { User } from '../users/entities/user.entity';
import { StorageService } from '../common/storage/storage.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { RedisService } from '../redis/redis.service';
import { DocumentType } from '../common/enums/document-type.enum';
import { KycStatus } from '../common/enums/kyc-status.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { KycRejectionReason } from './dto/reject-kyc.dto';

describe('KycService (Likora Identity & Age Compliance)', () => {
  let service: KycService;
  let kycRepoMock: any;
  let userRepoMock: any;
  let storageMock: any;
  let cryptoMock: any;
  let redisMock: any;
  let dataSourceMock: any;

  beforeEach(async () => {
    kycRepoMock = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ ...d, id: 'kyc-uuid-1' })),
    };

    userRepoMock = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    };

    storageMock = {
      generateKycKey: jest.fn().mockReturnValue('kyc-documents/user/1/front.jpg'),
      getPresignedUploadUrl: jest.fn().mockResolvedValue({ uploadUrl: 'https://s3.mock/upload', key: 'key' }),
      getPresignedDownloadUrl: jest.fn().mockResolvedValue('https://s3.mock/download'),
    };

    cryptoMock = {
      hashDocumentNumber: jest.fn().mockReturnValue('mocked-doc-hash-64'),
      encryptDocumentNumber: jest.fn().mockReturnValue('iv:tag:encrypted'),
      decryptDocumentNumber: jest.fn().mockReturnValue('12345678A'),
    };

    redisMock = {
      set: jest.fn().mockResolvedValue(undefined),
    };

    dataSourceMock = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        return cb({
          create: jest.fn().mockImplementation((entity, d) => d),
          save: jest.fn().mockImplementation((d) => Promise.resolve({ ...d, id: 'saved-id' })),
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycService,
        { provide: getRepositoryToken(IdentityVerification), useValue: kycRepoMock },
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: StorageService, useValue: storageMock },
        { provide: CryptoService, useValue: cryptoMock },
        { provide: RedisService, useValue: redisMock },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<KycService>(KycService);
  });

  describe('submitVerification', () => {
    it('debe rechazar y bloquear a usuarios menores de 18 años (Compliance Legal)', async () => {
      // Usuario con fecha de nacimiento de hace 16 años
      const minorBirthDate = new Date();
      minorBirthDate.setFullYear(minorBirthDate.getFullYear() - 16);

      userRepoMock.findOne.mockResolvedValue({
        id: 'minor-user-id',
        kyc_status: KycStatus.NOT_STARTED,
        status: UserStatus.ACTIVE,
      });

      await expect(
        service.submitVerification('minor-user-id', {
          verification_session_id: 'session-123',
          document_type: DocumentType.DNI,
          document_number: '12345678A',
          extracted_birth_date: minorBirthDate.toISOString().split('T')[0],
          front_image_key: 'front.jpg',
          selfie_image_key: 'selfie.jpg',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(userRepoMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: UserStatus.BLOCKED_UNDERAGE,
          kyc_status: KycStatus.REJECTED,
        }),
      );
    });

    it('debe impedir el registro si el documento ya está verificado en otra cuenta (Prevención de Fraude)', async () => {
      const adultBirthDate = new Date();
      adultBirthDate.setFullYear(adultBirthDate.getFullYear() - 25);

      userRepoMock.findOne.mockResolvedValue({
        id: 'user-id-2',
        kyc_status: KycStatus.NOT_STARTED,
        status: UserStatus.ACTIVE,
      });

      // Simula documento ya existente verificado para otro usuario
      kycRepoMock.findOne.mockResolvedValue({
        id: 'existing-kyc',
        user_id: 'different-user-id',
        status: KycStatus.VERIFIED,
      });

      await expect(
        service.submitVerification('user-id-2', {
          verification_session_id: 'session-456',
          document_type: DocumentType.DNI,
          document_number: '12345678A',
          extracted_birth_date: adultBirthDate.toISOString().split('T')[0],
          front_image_key: 'front.jpg',
          selfie_image_key: 'selfie.jpg',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe registrar exitosamente la verificación para un usuario mayor de edad', async () => {
      const adultBirthDate = new Date();
      adultBirthDate.setFullYear(adultBirthDate.getFullYear() - 22);

      userRepoMock.findOne.mockResolvedValue({
        id: 'adult-user-id',
        kyc_status: KycStatus.NOT_STARTED,
        status: UserStatus.ACTIVE,
      });
      kycRepoMock.findOne.mockResolvedValue(null);

      const res = await service.submitVerification('adult-user-id', {
        verification_session_id: 'session-valid',
        document_type: DocumentType.DNI,
        document_number: '87654321B',
        extracted_birth_date: adultBirthDate.toISOString().split('T')[0],
        front_image_key: 'front.jpg',
        selfie_image_key: 'selfie.jpg',
      });

      expect(res).toBeDefined();
      expect(cryptoMock.encryptDocumentNumber).toHaveBeenCalledWith('87654321B');
    });
  });

  describe('Auditoría Backoffice (Aprobación y Rechazo)', () => {
    it('debe aprobar una verificación y emitir evento en Redis', async () => {
      const verificationMock = {
        id: 'verif-1',
        user_id: 'user-1',
        status: KycStatus.PENDING_REVIEW,
        extracted_birth_date: new Date('1995-05-15'),
        user: { id: 'user-1', kyc_status: KycStatus.PENDING_REVIEW },
      };
      kycRepoMock.findOne.mockResolvedValue(verificationMock);

      const res = await service.approveVerification('verif-1', 'admin-id-99');

      expect(res.success).toBe(true);
      expect(res.status).toBe(KycStatus.VERIFIED);
      expect(redisMock.set).toHaveBeenCalled();
    });

    it('debe rechazar una verificación con motivo detallado', async () => {
      const verificationMock = {
        id: 'verif-2',
        user_id: 'user-2',
        status: KycStatus.PENDING_REVIEW,
        user: { id: 'user-2', kyc_status: KycStatus.PENDING_REVIEW },
      };
      kycRepoMock.findOne.mockResolvedValue(verificationMock);

      const res = await service.rejectVerification('verif-2', 'admin-id-99', {
        reason: KycRejectionReason.BLURRY_IMAGE,
        custom_notes: 'La foto frontal del DNI no es legible',
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe(KycStatus.REJECTED);
      expect(res.rejection_reason).toContain('BLURRY_IMAGE');
    });
  });
});
