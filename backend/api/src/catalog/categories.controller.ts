import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async getCategories() {
    const categories = await this.catalogService.getCategories(true);
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
