import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AddressesService } from './addresses.service';
import { UserAddress } from './entities/user-address.entity';

describe('AddressesService', () => {
  let service: AddressesService;
  let repo: any;
  let dataSource: any;

  const mockAddress = {
    id: 'addr-uuid-1',
    user_id: 'user-uuid-1',
    alias: 'Casa',
    street_address: 'Av. Principal 123',
    latitude: 10.48,
    longitude: -66.90,
    is_active: true,
    is_deleted: false,
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue([mockAddress]),
      findOne: jest.fn().mockResolvedValue(mockAddress),
      save: jest.fn().mockImplementation((a) => Promise.resolve({ ...a, id: a.id || 'new-uuid' })),
      count: jest.fn().mockResolvedValue(1),
    };

    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        create: jest.fn().mockImplementation((_, data) => data),
        save: jest.fn().mockImplementation((_, data) => Promise.resolve({ ...data, id: 'saved-uuid' })),
        findOne: jest.fn().mockResolvedValue(mockAddress),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: getRepositoryToken(UserAddress), useValue: repo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return user addresses', async () => {
    const addresses = await service.getUserAddresses('user-uuid-1');
    expect(addresses).toHaveLength(1);
    expect(addresses[0].alias).toBe('Casa');
  });

  it('should create an address and set as active if first address', async () => {
    const created = await service.createAddress('user-uuid-1', {
      alias: 'Trabajo',
      street_address: 'Calle 10',
      latitude: 10.5,
      longitude: -66.9,
      setActive: true,
    });
    expect(created.is_active).toBe(true);
  });
});
