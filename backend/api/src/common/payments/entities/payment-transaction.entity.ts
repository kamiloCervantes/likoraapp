import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'payment_transactions' })
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_intent_id', type: 'varchar', length: 255 })
  payment_intent_id: string;

  @Column({ name: 'order_id', type: 'varchar', length: 100, nullable: true })
  order_id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id: string;

  @Column({ name: 'amount', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ name: 'client_secret', type: 'text', nullable: true })
  client_secret: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, default: 'card' })
  payment_method: string;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receipt_url: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
