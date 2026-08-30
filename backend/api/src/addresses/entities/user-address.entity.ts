import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_addresses')
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  alias: string;

  @Column({ type: 'text', name: 'street_address' })
  street_address: string;

  @Column({ type: 'text', nullable: true })
  reference: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'numeric', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'boolean', default: false, name: 'is_active' })
  is_active: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  is_deleted: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}
