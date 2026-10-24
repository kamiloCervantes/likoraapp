import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async findAll(query?: { store_id?: string; only_active?: boolean }): Promise<Promotion[]> {
    const qb: SelectQueryBuilder<Promotion> = this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.store', 'store')
      .leftJoinAndSelect('promotion.category', 'category');

    if (query?.only_active !== false) {
      qb.andWhere('promotion.is_active = :isActive', { isActive: true });
    }

    if (query?.store_id) {
      // Devuelve promociones específicas de esta tienda o promociones globales (store_id IS NULL)
      qb.andWhere('(promotion.store_id = :storeId OR promotion.store_id IS NULL)', {
        storeId: query.store_id,
      });
    }

    return qb
      .orderBy('promotion.priority', 'DESC')
      .addOrderBy('promotion.created_at', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Promotion> {
    const promo = await this.promotionRepository.findOne({
      where: { id },
      relations: ['store', 'category'],
    });
    if (!promo) {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }
    return promo;
  }

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    const promo = this.promotionRepository.create({
      ...dto,
      discount_percentage: dto.discount_percentage ? Number(dto.discount_percentage) : undefined,
      priority: dto.priority !== undefined ? Number(dto.priority) : 1,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      gradient_color1: dto.gradient_color1 || '#5A189A',
      gradient_color2: dto.gradient_color2 || '#7B2CBF',
      button_text: dto.button_text || 'Ver Promociones',
    });
    return this.promotionRepository.save(promo);
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<Promotion> {
    const promo = await this.findById(id);

    const updated = this.promotionRepository.merge(promo, {
      ...dto,
      discount_percentage: dto.discount_percentage !== undefined ? Number(dto.discount_percentage) : promo.discount_percentage,
      priority: dto.priority !== undefined ? Number(dto.priority) : promo.priority,
    });

    return this.promotionRepository.save(updated);
  }

  async toggleStatus(id: string): Promise<Promotion> {
    const promo = await this.findById(id);
    promo.is_active = !promo.is_active;
    return this.promotionRepository.save(promo);
  }

  async delete(id: string): Promise<void> {
    const promo = await this.findById(id);
    await this.promotionRepository.remove(promo);
  }
}
