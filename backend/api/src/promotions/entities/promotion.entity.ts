import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../../catalog/entities/category.entity';

@Entity({ name: 'promotions' })
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'subtitle', type: 'text', nullable: true })
  subtitle: string;

  @Column({ name: 'button_text', type: 'varchar', length: 100, default: 'Ver Promociones' })
  button_text: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  image_url: string;

  @Column({ name: 'gradient_color1', type: 'varchar', length: 20, default: '#5A189A' })
  gradient_color1: string;

  @Column({ name: 'gradient_color2', type: 'varchar', length: 20, default: '#7B2CBF' })
  gradient_color2: string;

  @Column({ name: 'discount_percentage', type: 'numeric', precision: 5, scale: 2, nullable: true })
  discount_percentage: number;

  @Column({ name: 'discount_code', type: 'varchar', length: 50, nullable: true })
  discount_code: string;

  @Column({ name: 'store_id', type: 'uuid', nullable: true })
  store_id: string;

  @ManyToOne(() => Store, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  category_id: string;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @Column({ name: 'priority', type: 'int', default: 1 })
  priority: number;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  start_date: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  end_date: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
