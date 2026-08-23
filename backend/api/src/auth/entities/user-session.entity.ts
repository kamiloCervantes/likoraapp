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
import { Exclude } from 'class-transformer';
import { AppSource } from '../../common/enums/app-source.enum';
import { User } from '../../users/entities/user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Exclude()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, name: 'refresh_token_hash' })
  refresh_token_hash: string;

  @Column({
    type: 'enum',
    enum: AppSource,
    name: 'app_source',
  })
  app_source: AppSource;

  @Column({ type: 'varchar', length: 45, name: 'ip_address' })
  ip_address: string;

  @Column({ type: 'text', name: 'user_agent' })
  user_agent: string;

  @Column({ type: 'boolean', default: false, name: 'is_revoked' })
  is_revoked: boolean;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}
