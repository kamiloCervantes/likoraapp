import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('driver_locations')
export class DriverLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  driver_id: string | null;

  @Column({ type: 'varchar', length: 150, default: 'Carlos Mendoza' })
  driver_name: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  order_id: string | null;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ type: 'double precision', default: 0.0 })
  heading: number;

  @Column({ type: 'double precision', default: 0.0 })
  speed_kmh: number;

  @Column({ type: 'double precision', default: 5.0 })
  accuracy: number;

  @Column({ type: 'boolean', default: true })
  is_online: boolean;

  @Column({ type: 'varchar', length: 50, default: 'EN_CAMINO' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
