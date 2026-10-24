import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { PromotionsService } from './promotions.service';
import { AdminPromotionsController } from './admin-promotions.controller';
import { PromotionsController } from './promotions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion])],
  providers: [PromotionsService],
  controllers: [AdminPromotionsController, PromotionsController],
  exports: [PromotionsService],
})
export class PromotionsModule {}
