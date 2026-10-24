import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Controller('admin/promotions')
export class AdminPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  async getAllPromotions(@Query('store_id') storeId?: string) {
    const promotions = await this.promotionsService.findAll({
      store_id: storeId,
      only_active: false,
    });
    return {
      status: 'success',
      data: promotions,
    };
  }

  @Get(':id')
  async getPromotionById(@Param('id') id: string) {
    const promo = await this.promotionsService.findById(id);
    return {
      status: 'success',
      data: promo,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPromotion(@Body() dto: CreatePromotionDto) {
    const created = await this.promotionsService.create(dto);
    return {
      status: 'success',
      message: 'Promoción creada exitosamente',
      data: created,
    };
  }

  @Put(':id')
  async updatePromotion(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    const updated = await this.promotionsService.update(id, dto);
    return {
      status: 'success',
      message: 'Promoción actualizada exitosamente',
      data: updated,
    };
  }

  @Patch(':id/toggle')
  async toggleStatus(@Param('id') id: string) {
    const updated = await this.promotionsService.toggleStatus(id);
    return {
      status: 'success',
      message: `Promoción ${updated.is_active ? 'activada' : 'desactivada'} exitosamente`,
      data: updated,
    };
  }

  @Delete(':id')
  async deletePromotion(@Param('id') id: string) {
    await this.promotionsService.delete(id);
    return {
      status: 'success',
      message: 'Promoción eliminada exitosamente',
    };
  }
}
