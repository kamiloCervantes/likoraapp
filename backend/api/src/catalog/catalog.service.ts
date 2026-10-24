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
  async getCategories(onlyActive = true, storeId?: string): Promise<Category[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.store', 'store')
      .leftJoinAndSelect('category.subcategories', 'subcategories')
      .where('category.parent_id IS NULL');

    if (onlyActive) {
      query.andWhere('category.is_active = :isActive', { isActive: true });
    }

    if (storeId) {
      query.andWhere('(category.store_id = :storeId OR category.store_id IS NULL)', { storeId });
    }

    return query
      .orderBy('category.display_order', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .addOrderBy('subcategories.display_order', 'ASC')
      .addOrderBy('subcategories.name', 'ASC')
      .getMany();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['store', 'subcategories', 'products'],
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
      store_id: dto.store_id || null,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      display_order: dto.display_order ?? 0,
    });

    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.getCategoryById(id);

    if (dto.slug || (dto.name && dto.name !== category.name && !dto.slug)) {
      const newSlug = this.generateSlug(dto.slug || dto.name!);
      const existing = await this.categoryRepository.findOne({ where: { slug: newSlug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe otra categoría con el slug: ' + newSlug);
      }
      category.slug = newSlug;
    }

    if (dto.store_id !== undefined) category.store_id = dto.store_id || null;
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
      relations: ['store', 'category', 'subcategory'],
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
      store_id: dto.store_id || null,
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
      const newSlug = this.generateSlug(dto.slug || dto.name!);
      const existing = await this.productRepository.findOne({ where: { slug: newSlug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe un producto con el slug: ' + newSlug);
      }
      product.slug = newSlug;
    }

    if (dto.store_id !== undefined) product.store_id = dto.store_id || null;
    if (dto.subcategory_id !== undefined) product.subcategory_id = dto.subcategory_id || null;
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.compare_at_price !== undefined) product.compare_at_price = dto.compare_at_price;
    if (dto.stock_quantity !== undefined) product.stock_quantity = dto.stock_quantity;
    if (dto.images !== undefined) product.images = dto.images;
    if (dto.is_featured !== undefined) product.is_featured = dto.is_featured;
    if (dto.is_offer !== undefined) product.is_offer = dto.is_offer;
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

  // Algoritmo de Haversine para cálculo de distancia ortodrómica en kilómetros
  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  // ================= BÚSQUEDA Y LISTADO DE PRODUCTOS MULTI-TIENDA =================
  async searchProducts(queryDto: ProductSearchQueryDto, onlyActive = true) {
    const {
      store_id,
      q,
      category_id,
      subcategory_id,
      is_featured,
      is_offer,
      min_price,
      max_price,
      user_lat,
      user_lng,
      expand_stores = true,
      page = 1,
      limit = 50,
      sort = 'newest',
    } = queryDto;
    const skip = (page - 1) * limit;

    const qb: SelectQueryBuilder<Product> = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.store', 'store')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subcategory', 'subcategory');

    if (onlyActive) {
      qb.where('product.is_active = :isActive', { isActive: true });
    }

    if (store_id) {
      qb.andWhere('product.store_id = :storeId', { storeId: store_id });
    }

    if (category_id) {
      qb.andWhere('product.category_id = :categoryId', { categoryId: category_id });
    }

    if (subcategory_id) {
      qb.andWhere('product.subcategory_id = :subcategoryId', { subcategoryId: subcategory_id });
    }

    if (is_featured !== undefined) {
      qb.andWhere('product.is_featured = :isFeatured', { isFeatured: is_featured });
    }

    if (is_offer !== undefined) {
      qb.andWhere('product.is_offer = :isOffer', { isOffer: is_offer });
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

    // SI HAY RESULTADOS EN LA TIENDA SELECCIONADA, O NO SE BUSCÓ POR PALABRA CLAVE
    if (items.length > 0 || !q || !q.trim() || !store_id || expand_stores === false) {
      const enrichedItems = items.map((product) => {
        let storeDistanceKm: number | null = null;
        let storeDistanceFormatted: string | null = null;
        if (user_lat && user_lng && product.store?.latitude && product.store?.longitude) {
          storeDistanceKm = this.calculateHaversineDistance(
            Number(user_lat),
            Number(user_lng),
            Number(product.store.latitude),
            Number(product.store.longitude),
          );
          storeDistanceFormatted =
            storeDistanceKm < 1 ? `${Math.round(storeDistanceKm * 1000)} m` : `${storeDistanceKm.toFixed(1)} km`;
        }
        return {
          ...product,
          store_distance_km: storeDistanceKm,
          store_distance_formatted: storeDistanceFormatted,
        };
      });

      return {
        items: enrichedItems,
        meta: {
          currentPage: page,
          perPage: limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          matched_in_selected_store: items.length > 0 && !!store_id,
          expanded_to_other_stores: false,
          selected_store_id: store_id || null,
        },
      };
    }

    // SI NO SE ENCONTRÓ EL PRODUCTO EN LA TIENDA ACTUAL:
    // BUSCAR EN LAS DEMÁS TIENDAS Y PRIORIZAR POR LA TIENDA MÁS CERCANA
    const otherQb: SelectQueryBuilder<Product> = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.store', 'store')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subcategory', 'subcategory');

    if (onlyActive) {
      otherQb.where('product.is_active = :isActive', { isActive: true });
    }

    otherQb.andWhere('product.store_id != :storeId', { storeId: store_id });

    if (category_id) {
      otherQb.andWhere('product.category_id = :categoryId', { categoryId: category_id });
    }

    if (subcategory_id) {
      otherQb.andWhere('product.subcategory_id = :subcategoryId', { subcategoryId: subcategory_id });
    }

    const searchTerm = '%' + q.trim().toLowerCase() + '%';
    otherQb.andWhere(
      '(LOWER(product.name) LIKE :searchTerm OR LOWER(product.description) LIKE :searchTerm OR LOWER(product.sku) LIKE :searchTerm)',
      { searchTerm },
    );

    const otherItems = await otherQb.getMany();

    if (otherItems.length === 0) {
      return {
        items: [],
        meta: {
          currentPage: page,
          perPage: limit,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          matched_in_selected_store: false,
          expanded_to_other_stores: true,
          selected_store_id: store_id,
        },
      };
    }

    // Obtener coordenadas de referencia (usuario o centro predeterminado)
    const refLat = user_lat !== undefined ? Number(user_lat) : 6.208571;
    const refLng = user_lng !== undefined ? Number(user_lng) : -75.568434;

    // Calcular distancia a la tienda de cada producto
    const itemsWithDistance = otherItems.map((prod) => {
      const sLat = Number(prod.store?.latitude || 0);
      const sLng = Number(prod.store?.longitude || 0);
      const dist = (sLat !== 0 && sLng !== 0)
        ? this.calculateHaversineDistance(refLat, refLng, sLat, sLng)
        : 999.0;
      return {
        ...prod,
        store_distance_km: dist,
        store_distance_formatted: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
      };
    });

    // PRIORIDAD: Ordenar por distancia de la tienda más cercana ascendentemente
    itemsWithDistance.sort((a, b) => a.store_distance_km - b.store_distance_km);

    const paginated = itemsWithDistance.slice(skip, skip + limit);
    const nearestStore = paginated[0]?.store;

    return {
      items: paginated,
      meta: {
        currentPage: page,
        perPage: limit,
        totalItems: itemsWithDistance.length,
        totalPages: Math.ceil(itemsWithDistance.length / limit) || 1,
        hasNextPage: page < Math.ceil(itemsWithDistance.length / limit),
        hasPrevPage: page > 1,
        matched_in_selected_store: false,
        expanded_to_other_stores: true,
        selected_store_id: store_id,
        nearest_store_id: nearestStore?.id || null,
        nearest_store_name: nearestStore?.name || null,
        nearest_store_distance: paginated[0]?.store_distance_formatted || null,
      },
    };
  }

}