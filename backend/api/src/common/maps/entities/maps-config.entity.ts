import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'maps_configs' })
export class MapsConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'api_key_web', type: 'text', nullable: true })
  api_key_web: string;

  @Column({ name: 'api_key_android', type: 'text', nullable: true })
  api_key_android: string;

  @Column({ name: 'api_key_ios', type: 'text', nullable: true })
  api_key_ios: string;

  @Column({ name: 'api_key_server', type: 'text', nullable: true })
  api_key_server: string;

  @Column({ name: 'is_live_tracking_enabled', type: 'boolean', default: true })
  is_live_tracking_enabled: boolean;

  @Column({ name: 'is_directions_enabled', type: 'boolean', default: true })
  is_directions_enabled: boolean;

  @Column({ name: 'gps_update_interval_sec', type: 'int', default: 5 })
  gps_update_interval_sec: number;

  @Column({ name: 'default_center_lat', type: 'numeric', precision: 10, scale: 7, default: 6.2442030 })
  default_center_lat: number;

  @Column({ name: 'default_center_lng', type: 'numeric', precision: 10, scale: 7, default: -75.5925820 })
  default_center_lng: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
