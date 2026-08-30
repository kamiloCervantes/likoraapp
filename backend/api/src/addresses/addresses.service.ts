import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserAddress } from './entities/user-address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly addressRepository: Repository<UserAddress>,
    private readonly dataSource: DataSource,
  ) {}

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return this.addressRepository.find({
      where: { user_id: userId, is_deleted: false },
      order: { is_active: 'DESC', created_at: 'DESC' },
    });
  }

  async getActiveAddress(userId: string): Promise<UserAddress | null> {
    return this.addressRepository.findOne({
      where: { user_id: userId, is_active: true, is_deleted: false },
    });
  }

  async getAddressById(userId: string, addressId: string): Promise<UserAddress> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user_id: userId, is_deleted: false },
    });
    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }
    return address;
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<UserAddress> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAddressesCount = await queryRunner.manager.count(UserAddress, {
        where: { user_id: userId, is_deleted: false },
      });

      const shouldBeActive = dto.setActive === true || existingAddressesCount === 0;

      if (shouldBeActive) {
        await queryRunner.manager.update(
          UserAddress,
          { user_id: userId, is_deleted: false },
          { is_active: false },
        );
      }

      const newAddress = queryRunner.manager.create(UserAddress, {
        user_id: userId,
        alias: dto.alias,
        street_address: dto.street_address,
        reference: dto.reference ?? null,
        city: dto.city ?? null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        is_active: shouldBeActive,
      });

      const saved = await queryRunner.manager.save(UserAddress, newAddress);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<UserAddress> {
    const address = await this.getAddressById(userId, addressId);

    if (dto.alias !== undefined) address.alias = dto.alias;
    if (dto.street_address !== undefined) address.street_address = dto.street_address;
    if (dto.reference !== undefined) address.reference = dto.reference;
    if (dto.city !== undefined) address.city = dto.city;
    if (dto.latitude !== undefined) address.latitude = dto.latitude;
    if (dto.longitude !== undefined) address.longitude = dto.longitude;

    if (dto.is_active === true) {
      return this.setActiveAddress(userId, addressId);
    }

    return this.addressRepository.save(address);
  }

  async setActiveAddress(userId: string, addressId: string): Promise<UserAddress> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const address = await queryRunner.manager.findOne(UserAddress, {
        where: { id: addressId, user_id: userId, is_deleted: false },
      });

      if (!address) {
        throw new NotFoundException('Dirección no encontrada');
      }

      await queryRunner.manager.update(
        UserAddress,
        { user_id: userId, is_deleted: false },
        { is_active: false },
      );

      address.is_active = true;
      const updated = await queryRunner.manager.save(UserAddress, address);

      await queryRunner.commitTransaction();
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.getAddressById(userId, addressId);
    address.is_deleted = true;
    address.is_active = false;
    await this.addressRepository.save(address);

    // Si la dirección eliminada era la activa, activar la más reciente
    const nextActive = await this.addressRepository.findOne({
      where: { user_id: userId, is_deleted: false },
      order: { created_at: 'DESC' },
    });
    if (nextActive) {
      nextActive.is_active = true;
      await this.addressRepository.save(nextActive);
    }
  }
}
