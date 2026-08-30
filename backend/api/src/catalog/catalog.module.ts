import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { CatalogService } from './catalog.service';
import { CategoriesController } from './categories.controller';
import { ProductsController } from './products.controller';
import { AdminCatalogController } from './admin-catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product])],
  controllers: [CategoriesController, ProductsController, AdminCatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
