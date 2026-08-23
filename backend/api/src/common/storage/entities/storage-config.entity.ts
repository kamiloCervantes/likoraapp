import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StorageProvider {
  LOCAL = 'LOCAL',
  AWS_S3 = 'AWS_S3',
  CLOUDFLARE_R2 = 'CLOUDFLARE_R2',
  MINIO = 'MINIO',
}

@Entity({ name: 'storage_configs' })
export class StorageConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: StorageProvider,
    default: StorageProvider.LOCAL,
  })
  provider: StorageProvider;

  @Column({ type: 'varchar', length: 150, nullable: true })
  bucket_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  access_key_id: string;

  @Column({ type: 'text', nullable: true })
  secret_access_key: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  custom_domain: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
