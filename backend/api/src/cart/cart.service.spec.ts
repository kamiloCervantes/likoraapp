import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../catalog/entities/product.entity';

describe('CartService', () => {
  let service: CartService;
  let cartRepo: any;
  let cartItemRepo: any;
  let productRepo: any;

  const mockProduct = {
    id: 'prod-1',
    name: 'Vino Tinto',
    price: 20.0,
    stock_quantity: 10,
    images: [{ url: 'http://img.jpg', isCover: true }],
  };

  const mockCart = {
    id: 'cart-1',
    user_id: 'user-1',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-1',
        product: mockProduct,
        quantity: 2,
      },
    ],
  };

  beforeEach(async () => {
    cartRepo = {
      findOne: jest.fn().mockResolvedValue(mockCart),
      create: jest.fn().mockImplementation((c) => c),
      save: jest.fn().mockImplementation((c) => Promise.resolve({ ...c, id: 'cart-1' })),
    };

    cartItemRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((i) => i),
      save: jest.fn().mockImplementation((i) => Promise.resolve({ ...i, id: 'item-1' })),
      remove: jest.fn(),
      delete: jest.fn(),
    };

    productRepo = {
      findOne: jest.fn().mockResolvedValue(mockProduct),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: cartRepo },
        { provide: getRepositoryToken(CartItem), useValue: cartItemRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should calculate cart summary with subtotal, tax, and total', async () => {
    const summary = await service.getCartSummary('user-1');
    expect(summary.items).toHaveLength(1);
    expect(summary.summary.subtotal).toBe(40.0);
    expect(summary.summary.tax).toBe(6.4);
    expect(summary.summary.deliveryFee).toBe(2.5);
    expect(summary.summary.total).toBe(48.9);
  });
});
