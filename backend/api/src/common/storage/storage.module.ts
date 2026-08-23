import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { StorageAdminController } from './storage-admin.controller';
import { StorageConfig } from './entities/storage-config.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([StorageConfig])],
  controllers: [StorageController, StorageAdminController],
  providers: [StorageService],
  exports: [StorageService, TypeOrmModule],
})
export class StorageModule {}
