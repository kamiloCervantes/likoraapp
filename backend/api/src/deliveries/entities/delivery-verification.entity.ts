import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('delivery_verifications')
export class DeliveryVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  order_id: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  driver_id: string | null;

  @Column({ type: 'varchar', length: 150, default: 'Carlos Mendoza' })
  driver_name: string;

  @Column({ type: 'varchar', length: 150 })
  receiver_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  receiver_id_number: string | null;

  @Column({ type: 'varchar', length: 50, default: 'TITULAR' })
  receiver_relationship: string;

  @Column({ type: 'text' })
  id_image_url: string;

  @Column({ type: 'text', nullable: true })
  signature_url: string | null;

  @Column({ type: 'double precision' })
  delivery_latitude: number;

  @Column({ type: 'double precision' })
  delivery_longitude: number;

  @Column({ type: 'text', nullable: true })
  delivery_address: string | null;

  @Column({ type: 'double precision', default: 3.0 })
  delivery_accuracy: number;

  @Column({ type: 'varchar', length: 50, default: 'VERIFICADO' })
  verification_status: string;

  @Column({ type: 'boolean', default: true })
  is_adult_verified: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Index()
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  delivered_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
