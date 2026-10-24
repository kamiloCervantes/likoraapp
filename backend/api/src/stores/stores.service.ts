import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreQueryDto } from './dto/store-query.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
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

  async findAll(query?: StoreQueryDto): Promise<Store[]> {
    const qb: SelectQueryBuilder<Store> = this.storeRepository.createQueryBuilder('store');

    if (query?.is_active !== undefined) {
      qb.andWhere('store.is_active = :isActive', { isActive: query.is_active });
    }

    if (query?.city) {
      qb.andWhere('LOWER(store.city) = :city', { city: query.city.toLowerCase() });
    }

    if (query?.pos_type) {
      qb.andWhere('store.pos_type = :posType', { posType: query.pos_type });
    }

    if (query?.q && query.q.trim().length > 0) {
      const search = '%' + query.q.trim().toLowerCase() + '%';
      qb.andWhere(
        '(LOWER(store.name) LIKE :search OR LOWER(store.address) LIKE :search OR LOWER(store.code) LIKE :search OR LOWER(store.city) LIKE :search)',
        { search },
      );
    }

    return qb
      .orderBy('store.is_main', 'DESC')
      .addOrderBy('store.name', 'ASC')
      .getMany();
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException('Tienda o punto de venta con ID ' + id + ' no encontrado');
    }
    return store;
  }

  async create(dto: CreateStoreDto): Promise<Store> {
    const slug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.name);
    const existingSlug = await this.storeRepository.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException('Ya existe una tienda con el slug: ' + slug);
    }

    if (dto.code) {
      const existingCode = await this.storeRepository.findOne({ where: { code: dto.code } });
      if (existingCode) {
        throw new ConflictException('El código ' + dto.code + ' ya está asignado a otra tienda');
      }
    }

    if (dto.is_main) {
      await this.storeRepository.update({ is_main: true }, { is_main: false });
    }

    const store = this.storeRepository.create({
      ...dto,
      slug,
      latitude: Number(dto.latitude),
      longitude: Number(dto.longitude),
      coverage_radius_km: dto.coverage_radius_km !== undefined ? Number(dto.coverage_radius_km) : 5.0,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      is_main: dto.is_main !== undefined ? dto.is_main : false,
    });

    return this.storeRepository.save(store);
  }

  async update(id: string, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findById(id);

    if (dto.slug || (dto.name && dto.name !== store.name && !dto.slug)) {
      const newSlug = this.generateSlug(dto.slug || dto.name!);
      const existing = await this.storeRepository.findOne({ where: { slug: newSlug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe otra tienda con el slug: ' + newSlug);
      }
      store.slug = newSlug;
    }

    if (dto.code && dto.code !== store.code) {
      const existing = await this.storeRepository.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== id) {
        throw new ConflictException('El código ' + dto.code + ' ya está en uso.');
      }
      store.code = dto.code;
    }

    if (dto.is_main && !store.is_main) {
      await this.storeRepository.update({ is_main: true }, { is_main: false });
    }

    if (dto.name !== undefined) store.name = dto.name;
    if (dto.description !== undefined) store.description = dto.description;
    if (dto.phone !== undefined) store.phone = dto.phone;
    if (dto.email !== undefined) store.email = dto.email;
    if (dto.address !== undefined) store.address = dto.address;
    if (dto.city !== undefined) store.city = dto.city;
    if (dto.state !== undefined) store.state = dto.state;
    if (dto.country !== undefined) store.country = dto.country;
    if (dto.latitude !== undefined) store.latitude = Number(dto.latitude);
    if (dto.longitude !== undefined) store.longitude = Number(dto.longitude);
    if (dto.coverage_radius_km !== undefined) store.coverage_radius_km = Number(dto.coverage_radius_km);
    if (dto.opening_time !== undefined) store.opening_time = dto.opening_time;
    if (dto.closing_time !== undefined) store.closing_time = dto.closing_time;
    if (dto.pos_type !== undefined) store.pos_type = dto.pos_type;
    if (dto.is_active !== undefined) store.is_active = dto.is_active;
    if (dto.is_main !== undefined) store.is_main = dto.is_main;

    return this.storeRepository.save(store);
  }

  async toggleStatus(id: string): Promise<Store> {
    const store = await this.findById(id);
    store.is_active = !store.is_active;
    return this.storeRepository.save(store);
  }

  async delete(id: string): Promise<void> {
    const store = await this.findById(id);
    await this.storeRepository.remove(store);
  }

  // Algoritmo de Haversine para cálculo de distancia ortodrómica en kilómetros
  calculateHaversineDistance(
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

  async findNearest(lat: number, lng: number, limit: number = 5) {
    const stores = await this.storeRepository.find({
      where: { is_active: true },
    });

    if (!stores || stores.length === 0) {
      throw new NotFoundException('No hay tiendas o puntos de venta activos disponibles');
    }

    const storesWithDistance = stores.map((store) => {
      const distance_km = this.calculateHaversineDistance(
        lat,
        lng,
        Number(store.latitude),
        Number(store.longitude),
      );
      const is_within_coverage = distance_km <= Number(store.coverage_radius_km);
      return {
        ...store,
        distance_km,
        distance_formatted:
          distance_km < 1
            ? `${Math.round(distance_km * 1000)} m`
            : `${distance_km.toFixed(1)} km`,
        is_within_coverage,
      };
    });

    // Ordenar ascendentemente por distancia
    storesWithDistance.sort((a, b) => a.distance_km - b.distance_km);

    const nearestStore = storesWithDistance[0];

    return {
      user_location: { latitude: lat, longitude: lng },
      nearest_store: nearestStore,
      stores: storesWithDistance.slice(0, limit),
    };
  }

}