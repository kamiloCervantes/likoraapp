import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService (PII Encryption & Hashing)', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultVal: string) => defaultVal,
          },
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('debe generar un hash SHA-256 determinista para un documento', () => {
    const hash1 = service.hashDocumentNumber('12345678A');
    const hash2 = service.hashDocumentNumber('12345678a');
    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
  });

  it('debe cifrar y descifrar un número de documento con AES-256-GCM', () => {
    const docNumber = 'DNI-98765432-Z';
    const encrypted = service.encryptDocumentNumber(docNumber);
    expect(encrypted).toContain(':');

    const decrypted = service.decryptDocumentNumber(encrypted);
    expect(decrypted).toBe(docNumber.toUpperCase());
  });

  it('debe fallar al intentar descifrar con payload corrupto', () => {
    expect(() => service.decryptDocumentNumber('invalid_payload')).toThrow();
  });
});
