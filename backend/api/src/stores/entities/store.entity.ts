import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PointOfSaleType {
  PHYSICAL_STORE = 'physical_store',
  DARK_STORE = 'dark_store',
  EXPRESS_KIOSK = 'express_kiosk',
  WAREHOUSE = 'warehouse',
}

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 180, unique: true })
  slug: string;

  @Index({ unique: true, where: 'code IS NOT NULL' })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  code: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100, default: 'Medellín' })
  city: string;

  @Column({ type: 'varchar', length: 100, default: 'Antioquia' })
  state: string;

  @Column({ type: 'varchar', length: 100, default: 'Colombia' })
  country: string;

  @Column({ type: 'numeric', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, default: 5.0, name: 'coverage_radius_km' })
  coverage_radius_km: number;

  @Column({ type: 'varchar', length: 20, default: '10:00', name: 'opening_time' })
  opening_time: string;

  @Column({ type: 'varchar', length: 20, default: '02:00', name: 'closing_time' })
  closing_time: string;

  @Column({
    type: 'enum',
    enum: PointOfSaleType,
    default: PointOfSaleType.PHYSICAL_STORE,
    name: 'pos_type',
  })
  pos_type: PointOfSaleType;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  is_active: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_main' })
  is_main: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}
