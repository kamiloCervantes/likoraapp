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
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreQueryDto } from './dto/store-query.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async getAllStores(@Query() query: StoreQueryDto) {
    const stores = await this.storesService.findAll(query);
    return {
      status: 'success',
      data: stores,
    };
  }


  @Get('nearest')
  async getNearestStore(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('limit') limit?: number,
  ) {
    if (lat === undefined || lng === undefined) {
      throw new BadRequestException('Se requieren las coordenadas numéricas lat y lng');
    }
    const result = await this.storesService.findNearest(
      Number(lat),
      Number(lng),
      limit ? Number(limit) : 5,
    );
    return {
      status: 'success',
      data: result,
    };
  }

  @Get(':id')
  async getStoreById(@Param('id') id: string) {
    const store = await this.storesService.findById(id);
    return {
      status: 'success',
      data: store,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStore(@Body() dto: CreateStoreDto) {
    const store = await this.storesService.create(dto);
    return {
      status: 'success',
      message: 'Tienda o punto de venta creado exitosamente',
      data: store,
    };
  }

  @Put(':id')
  async updateStore(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    const store = await this.storesService.update(id, dto);
    return {
      status: 'success',
      message: 'Tienda o punto de venta actualizado exitosamente',
      data: store,
    };
  }

  @Patch(':id/toggle')
  async toggleStoreStatus(@Param('id') id: string) {
    const store = await this.storesService.toggleStatus(id);
    return {
      status: 'success',
      message: 'Estado del punto de venta actualizado exitosamente',
      data: store,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteStore(@Param('id') id: string) {
    await this.storesService.delete(id);
    return {
      status: 'success',
      message: 'Punto de venta eliminado exitosamente',
    };
  }
}
