import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/v1/users/me/addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async getAddresses(@CurrentUser() user: User) {
    const addresses = await this.addressesService.getUserAddresses(user.id);
    return {
      status: 'success',
      data: addresses,
    };
  }

  @Get('active')
  async getActiveAddress(@CurrentUser() user: User) {
    const address = await this.addressesService.getActiveAddress(user.id);
    return {
      status: 'success',
      data: address,
    };
  }

  @Get(':id')
  async getAddressById(@CurrentUser() user: User, @Param('id') id: string) {
    const address = await this.addressesService.getAddressById(user.id, id);
    return {
      status: 'success',
      data: address,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAddress(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    const address = await this.addressesService.createAddress(user.id, dto);
    return {
      status: 'success',
      message: 'Dirección guardada exitosamente',
      data: address,
    };
  }

  @Put(':id')
  async updateAddress(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressesService.updateAddress(user.id, id, dto);
    return {
      status: 'success',
      message: 'Dirección actualizada exitosamente',
      data: address,
    };
  }

  @Patch(':id/activate')
  async activateAddress(@CurrentUser() user: User, @Param('id') id: string) {
    const address = await this.addressesService.setActiveAddress(user.id, id);
    return {
      status: 'success',
      message: 'Dirección activa actualizada',
      data: address,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(@CurrentUser() user: User, @Param('id') id: string) {
    await this.addressesService.deleteAddress(user.id, id);
  }
}
