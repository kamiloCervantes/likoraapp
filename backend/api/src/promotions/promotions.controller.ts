import { Controller, Get, Param, Query } from '@nestjs/common';
import { PromotionsService } from './promotions.service';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  async getActivePromotions(@Query('store_id') storeId?: string) {
    const promotions = await this.promotionsService.findAll({
      store_id: storeId,
      only_active: true,
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
}
