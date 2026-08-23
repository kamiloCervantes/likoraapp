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
import { DocumentType } from '../../common/enums/document-type.enum';
import { KycStatus } from '../../common/enums/kyc-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('identity_verifications')
export class IdentityVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.identity_verifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: DocumentType,
    name: 'document_type',
  })
  document_type: DocumentType;

  /**
   * Hash criptográfico SHA-256 del documento para evitar fraude y duplicidad de cuentas.
   */
  @Index()
  @Column({ type: 'varchar', length: 64, name: 'document_number_hash' })
  document_number_hash: string;

  /**
   * Documento cifrado con clave simétrica en reposo para propósitos de auditoría legal.
   */
  @Column({ type: 'text', nullable: true, name: 'document_number_enc' })
  document_number_enc: string | null;

  @Column({ type: 'date', name: 'extracted_birth_date' })
  extracted_birth_date: Date;

  @Column({ type: 'text', name: 'front_image_path' })
  front_image_path: string;

  @Column({ type: 'text', nullable: true, name: 'back_image_path' })
  back_image_path: string | null;

  @Column({ type: 'text', name: 'selfie_image_path' })
  selfie_image_path: string;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.PENDING_REVIEW,
  })
  status: KycStatus;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejection_reason: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'reviewed_by_user_id' })
  reviewed_by_user_id: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewed_by: User | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'verified_at' })
  verified_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expires_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}
