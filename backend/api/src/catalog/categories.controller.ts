import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async getCategories(@Query('store_id') storeId?: string) {
    const categories = await this.catalogService.getCategories(true, storeId);
    return {
      status: 'success',
      data: categories,
    };
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    const category = await this.catalogService.getCategoryById(id);
    return {
      status: 'success',
      data: category,
    };
  }
}
