import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'payment_configs' })
export class PaymentConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider', type: 'varchar', length: 50, default: 'stripe' })
  provider: string;

  @Column({ name: 'publishable_key', type: 'text' })
  publishable_key: string;

  @Column({ name: 'secret_key', type: 'text' })
  secret_key: string;

  @Column({ name: 'webhook_secret', type: 'text', nullable: true })
  webhook_secret: string;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'is_live_mode', type: 'boolean', default: false })
  is_live_mode: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @Column({ name: 'merchant_name', type: 'varchar', length: 255, default: 'Likora Liquors & Spirits' })
  merchant_name: string;

  @Column({ name: 'statement_descriptor', type: 'varchar', length: 50, default: 'LIKORA' })
  statement_descriptor: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
