import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../catalog/entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['items', 'items.product', 'items.product.category'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user_id: userId,
        items: [],
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCartSummary(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    let subtotal = 0;
    let totalItems = 0;

    const formattedItems = (cart.items || []).map((item) => {
      const product = item.product;
      const unitPrice = Number(product?.price || 0);
      const itemSubtotal = unitPrice * item.quantity;
      const isStockSufficient = product ? product.stock_quantity >= item.quantity : false;

      subtotal += itemSubtotal;
      totalItems += item.quantity;

      const coverImage = product?.images?.find((img) => img.isCover)?.url || product?.images?.[0]?.url || null;

      return {
        itemId: item.id,
        productId: item.product_id,
        name: product?.name || 'Producto no disponible',
        slug: product?.slug || '',
        unitPrice,
        quantity: item.quantity,
        subtotal: Number(itemSubtotal.toFixed(2)),
        availableStock: product?.stock_quantity || 0,
        isStockSufficient,
        image: coverImage,
      };
    });

    const tax = Number((subtotal * 0.16).toFixed(2));
    const deliveryFee = subtotal > 0 ? 2.50 : 0.00;
    const total = Number((subtotal + tax + deliveryFee).toFixed(2));

    return {
      cartId: cart.id,
      items: formattedItems,
      summary: {
        itemCount: totalItems,
        subtotal: Number(subtotal.toFixed(2)),
        tax,
        deliveryFee,
        total,
      },
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.productRepository.findOne({
      where: { id: dto.productId, is_active: true },
    });

    if (!product) {
      throw new NotFoundException('El producto solicitado no existe o está inactivo.');
    }

    let item = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id: dto.productId },
    });

    const targetQuantity = item ? item.quantity + dto.quantity : dto.quantity;

    if (product.stock_quantity < targetQuantity) {
      throw new ConflictException(
        'Stock insuficiente. Solicitado: ' + targetQuantity + ', Disponible: ' + product.stock_quantity,
      );
    }

    if (item) {
      item.quantity = targetQuantity;
      await this.cartItemRepository.save(item);
    } else {
      item = this.cartItemRepository.create({
        cart_id: cart.id,
        product_id: dto.productId,
        quantity: dto.quantity,
      });
      await this.cartItemRepository.save(item);
    }

    return this.getCartSummary(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cart_id: cart.id },
      relations: ['product'],
    });

    if (!item) {
      throw new NotFoundException('Ítem de carrito no encontrado.');
    }

    if (dto.quantity === 0) {
      await this.cartItemRepository.remove(item);
      return this.getCartSummary(userId);
    }

    if (item.product.stock_quantity < dto.quantity) {
      throw new ConflictException(
        'Stock insuficiente. Solicitado: ' + dto.quantity + ', Disponible: ' + item.product.stock_quantity,
      );
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    return this.getCartSummary(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cart_id: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Ítem no encontrado en el carrito.');
    }

    await this.cartItemRepository.remove(item);
    return this.getCartSummary(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemRepository.delete({ cart_id: cart.id });
    return this.getCartSummary(userId);
  }
}
