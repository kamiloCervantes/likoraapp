import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CatalogService } from './catalog.service';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';

describe('CatalogService', () => {
  let service: CatalogService;
  let categoryRepo: any;
  let productRepo: any;

  beforeEach(async () => {
    categoryRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((c) => c),
      save: jest.fn().mockImplementation((c) => Promise.resolve({ ...c, id: 'cat-uuid-1' })),
      remove: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'cat-uuid-1', name: 'Bebidas', slug: 'bebidas' }]),
      }),
    };

    productRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'prod-uuid-1', name: 'Ron', price: 10, stock_quantity: 5 }),
      create: jest.fn().mockImplementation((p) => p),
      save: jest.fn().mockImplementation((p) => Promise.resolve({ ...p, id: 'prod-uuid-1' })),
      remove: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'prod-1', name: 'Ron' }], 1]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: getRepositoryToken(Category), useValue: categoryRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  it('should list active categories', async () => {
    const categories = await service.getCategories(true);
    expect(categories).toHaveLength(1);
    expect(categories[0].slug).toBe('bebidas');
  });

  it('should search products with pagination', async () => {
    const result = await service.searchProducts({ q: 'ron', page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.meta.totalItems).toBe(1);
  });
});
