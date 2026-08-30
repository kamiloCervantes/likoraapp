import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSearchQueryDto } from './dto/product-search-query.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ================= CATEGORÍAS =================
  async getCategories(onlyActive = true): Promise<Category[]> {
    const query = this.categoryRepository.createQueryBuilder('category');
    if (onlyActive) {
      query.where('category.is_active = :isActive', { isActive: true });
    }
    return query.orderBy('category.display_order', 'ASC').addOrderBy('category.name', 'ASC').getMany();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.name);
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Ya existe una categoría con el slug: ' + slug);
    }

    const category = this.categoryRepository.create({
      ...dto,
      slug,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      display_order: dto.display_order ?? 0,
    });

    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.getCategoryById(id);

    if (dto.slug || (dto.name && dto.name !== category.name && !dto.slug)) {
      const newSlug = this.generateSlug(dto.slug || dto.name);
      const existing = await this.categoryRepository.findOne({ where: { slug: newSlug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe otra categoría con el slug: ' + newSlug);
      }
      category.slug = newSlug;
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.image_url !== undefined) category.image_url = dto.image_url;
    if (dto.display_order !== undefined) category.display_order = dto.display_order;
    if (dto.is_active !== undefined) category.is_active = dto.is_active;

    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id);
    const productsCount = await this.productRepository.count({ where: { category_id: id } });
    if (productsCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la categoría porque contiene ' + productsCount + ' producto(s) asociados. Desactívela o mueva los productos primero.',
      );
    }
    await this.categoryRepository.remove(category);
  }

  // ================= PRODUCTOS =================
  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    await this.getCategoryById(dto.category_id);

    const slug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.name);
    const existingSlug = await this.productRepository.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException('Ya existe un producto con el slug: ' + slug);
    }

    if (dto.sku) {
      const existingSku = await this.productRepository.findOne({ where: { sku: dto.sku } });
      if (existingSku) {
        throw new ConflictException('El SKU ' + dto.sku + ' ya está en uso.');
      }
    }

    const product = this.productRepository.create({
      ...dto,
      slug,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      stock_quantity: dto.stock_quantity ?? 0,
      images: dto.images ?? [],
    });

    return this.productRepository.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.getProductById(id);

    if (dto.category_id && dto.category_id !== product.category_id) {
      await this.getCategoryById(dto.category_id);
      product.category_id = dto.category_id;
    }

    if (dto.sku && dto.sku !== product.sku) {
      const existingSku = await this.productRepository.findOne({ where: { sku: dto.sku } });
      if (existingSku && existingSku.id !== id) {
        throw new ConflictException('El SKU ' + dto.sku + ' ya está asignado a otro producto.');
      }
      product.sku = dto.sku;
    }

    if (dto.slug || (dto.name && dto.name !== product.name && !dto.slug)) {
      const newSlug = this.generateSlug(dto.slug || dto.name);
      const existing = await this.productRepository.findOne({ where: { slug: newSlug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe un producto con el slug: ' + newSlug);
      }
      product.slug = newSlug;
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.compare_at_price !== undefined) product.compare_at_price = dto.compare_at_price;
    if (dto.stock_quantity !== undefined) product.stock_quantity = dto.stock_quantity;
    if (dto.images !== undefined) product.images = dto.images;
    if (dto.is_active !== undefined) product.is_active = dto.is_active;

    return this.productRepository.save(product);
  }

  async updateStock(id: string, adjustment: number): Promise<Product> {
    const product = await this.getProductById(id);
    const newStock = product.stock_quantity + adjustment;
    if (newStock < 0) {
      throw new BadRequestException('El ajuste dejaría el stock en negativo (Actual: ' + product.stock_quantity + ', Ajuste: ' + adjustment + ')');
    }
    product.stock_quantity = newStock;
    return this.productRepository.save(product);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);
    await this.productRepository.remove(product);
  }

  // ================= BÚSQUEDA Y LISTADO DE PRODUCTOS =================
  async searchProducts(queryDto: ProductSearchQueryDto, onlyActive = true) {
    const { q, category_id, min_price, max_price, page = 1, limit = 20, sort = 'newest' } = queryDto;
    const skip = (page - 1) * limit;

    const qb: SelectQueryBuilder<Product> = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (onlyActive) {
      qb.where('product.is_active = :isActive', { isActive: true });
    }

    if (category_id) {
      qb.andWhere('product.category_id = :categoryId', { categoryId: category_id });
    }

    if (min_price !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: min_price });
    }

    if (max_price !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: max_price });
    }

    if (q && q.trim().length > 0) {
      const searchTerm = '%' + q.trim().toLowerCase() + '%';
      qb.andWhere(
        '(LOWER(product.name) LIKE :searchTerm OR LOWER(product.description) LIKE :searchTerm OR LOWER(product.sku) LIKE :searchTerm)',
        { searchTerm },
      );
    }

    switch (sort) {
      case 'price_asc':
        qb.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('product.price', 'DESC');
        break;
      case 'name_asc':
        qb.orderBy('product.name', 'ASC');
        break;
      case 'newest':
      default:
        qb.orderBy('product.created_at', 'DESC');
        break;
    }

    qb.skip(skip).take(limit);

    const [items, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      meta: {
        currentPage: page,
        perPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
