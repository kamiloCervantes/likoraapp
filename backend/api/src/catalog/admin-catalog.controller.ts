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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSearchQueryDto } from './dto/product-search-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STORE_OPERATOR)
export class AdminCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ================= CATEGORÍAS =================
  @Get('categories')
  async getAllCategories() {
    const categories = await this.catalogService.getCategories(false);
    return {
      status: 'success',
      data: categories,
    };
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.catalogService.createCategory(dto);
    return {
      status: 'success',
      message: 'Categoría creada exitosamente',
      data: category,
    };
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.catalogService.updateCategory(id, dto);
    return {
      status: 'success',
      message: 'Categoría actualizada exitosamente',
      data: category,
    };
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string) {
    await this.catalogService.deleteCategory(id);
  }

  // ================= PRODUCTOS =================
  @Get('products')
  async getAllProducts(@Query() query: ProductSearchQueryDto) {
    const result = await this.catalogService.searchProducts(query, false);
    return {
      status: 'success',
      data: result.items,
      meta: result.meta,
    };
  }

  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() dto: CreateProductDto) {
    const product = await this.catalogService.createProduct(dto);
    return {
      status: 'success',
      message: 'Producto creado exitosamente',
      data: product,
    };
  }

  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.catalogService.updateProduct(id, dto);
    return {
      status: 'success',
      message: 'Producto actualizado exitosamente',
      data: product,
    };
  }

  @Patch('products/:id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body('adjustment') adjustment: number,
  ) {
    const product = await this.catalogService.updateStock(id, Number(adjustment));
    return {
      status: 'success',
      message: 'Stock de producto actualizado',
      data: product,
    };
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string) {
    await this.catalogService.deleteProduct(id);
  }
}
