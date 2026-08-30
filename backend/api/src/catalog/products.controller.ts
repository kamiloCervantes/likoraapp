import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ProductSearchQueryDto } from './dto/product-search-query.dto';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('search')
  async searchProducts(@Query() query: ProductSearchQueryDto) {
    const result = await this.catalogService.searchProducts(query, true);
    return {
      status: 'success',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const product = await this.catalogService.getProductById(id);
    return {
      status: 'success',
      data: product,
    };
  }
}
