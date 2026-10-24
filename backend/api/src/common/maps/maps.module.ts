import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapsConfig } from './entities/maps-config.entity';
import { MapsService } from './maps.service';
import { MapsAdminController } from './maps-admin.controller';
import { MapsController } from './maps.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MapsConfig])],
  controllers: [MapsAdminController, MapsController],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule {}
