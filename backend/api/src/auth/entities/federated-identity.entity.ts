import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { AuthProvider } from '../../common/enums/auth-provider.enum';
import { User } from '../../users/entities/user.entity';

@Entity('federated_identities')
@Unique(['provider', 'provider_user_id'])
export class FederatedIdentity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.federated_identities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AuthProvider,
  })
  provider: AuthProvider;

  @Column({ type: 'varchar', length: 255, name: 'provider_user_id' })
  provider_user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_at_provider' })
  email_at_provider: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'raw_profile_data' })
  raw_profile_data: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}
