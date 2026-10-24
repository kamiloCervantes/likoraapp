import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true, name: 'store_id' })
  store_id: string | null;

  @ManyToOne(() => Store, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'store_id' })
  store: Store | null;

  @Index()
  @Column({ type: 'uuid', name: 'category_id' })
  category_id: string;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Index()
  @Column({ type: 'uuid', nullable: true, name: 'subcategory_id' })
  subcategory_id: string | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Category | null;

  @Index({ unique: true, where: 'sku IS NOT NULL' })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true, name: 'compare_at_price' })
  compare_at_price: number | null;

  @Column({ type: 'int', default: 0, name: 'stock_quantity' })
  stock_quantity: number;

  @Column({ type: 'jsonb', default: [] })
  images: Array<{ url: string; isCover?: boolean; alt?: string }>;

  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  is_featured: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_offer' })
  is_offer: boolean;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 4.8 })
  rating: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}
