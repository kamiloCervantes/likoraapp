import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('El correo electrónico ya se encuentra registrado');
      }
    }

    if (createUserDto.phone_number) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone_number: createUserDto.phone_number },
      });
      if (existingPhone) {
        throw new ConflictException('El número de teléfono ya se encuentra registrado');
      }
    }

    const user = this.userRepository.create({
      ...createUserDto,
      birth_date: createUserDto.birth_date ? new Date(createUserDto.birth_date) : null,
    });

    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['federated_identities', 'identity_verifications'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (updateUserDto.display_name !== undefined) user.display_name = updateUserDto.display_name;
    if (updateUserDto.phone_number !== undefined) user.phone_number = updateUserDto.phone_number;
    if (updateUserDto.birth_date !== undefined)
      user.birth_date = new Date(updateUserDto.birth_date);

    return this.userRepository.save(user);
  }
}
