import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/v1/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: User) {
    const cart = await this.cartService.getCartSummary(user.id);
    return {
      status: 'success',
      data: cart,
    };
  }

  @Post('items')
  async addItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    const cart = await this.cartService.addItem(user.id, dto);
    return {
      status: 'success',
      message: 'Producto añadido al carrito',
      data: cart,
    };
  }

  @Put('items/:itemId')
  async updateQuantity(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateItemQuantity(user.id, itemId, dto);
    return {
      status: 'success',
      message: 'Cantidad actualizada',
      data: cart,
    };
  }

  @Delete('items/:itemId')
  async removeItem(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    const cart = await this.cartService.removeItem(user.id, itemId);
    return {
      status: 'success',
      message: 'Producto eliminado del carrito',
      data: cart,
    };
  }

  @Delete('clear')
  async clearCart(@CurrentUser() user: User) {
    const cart = await this.cartService.clearCart(user.id);
    return {
      status: 'success',
      message: 'Carrito vaciado exitosamente',
      data: cart,
    };
  }
}
