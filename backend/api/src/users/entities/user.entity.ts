import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { KycStatus } from '../../common/enums/kyc-status.enum';
import { FederatedIdentity } from '../../auth/entities/federated-identity.entity';
import { IdentityVerification } from '../../kyc/entities/identity-verification.entity';
import { UserSession } from '../../auth/entities/user-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true, where: 'email IS NOT NULL' })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  email_verified: boolean;

  @Index({ unique: true, where: 'phone_number IS NOT NULL' })
  @Column({ type: 'varchar', length: 30, unique: true, nullable: true, name: 'phone_number' })
  phone_number: string | null;

  @Column({ type: 'boolean', default: false, name: 'phone_verified' })
  phone_verified: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' })
  password_hash: string | null;

  @Column({ type: 'varchar', length: 150, name: 'display_name' })
  display_name: string;

  @Column({ type: 'date', nullable: true, name: 'birth_date' })
  birth_date: Date | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSUMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_STARTED,
    name: 'kyc_status',
  })
  kyc_status: KycStatus;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
    name: 'last_known_location',
  })
  last_known_location: string | object | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;

  // Relaciones
  @OneToMany(() => FederatedIdentity, (identity) => identity.user, { cascade: true })
  federated_identities: FederatedIdentity[];

  @OneToMany(() => IdentityVerification, (verification) => verification.user)
  identity_verifications: IdentityVerification[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  /**
   * Helper para verificar si el usuario tiene mayoría de edad legal (>= 18 años).
   */
  get isAdult(): boolean {
    if (!this.birth_date) return false;
    const today = new Date();
    const birthDate = new Date(this.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }
}
