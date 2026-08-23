import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailProvider {
  SMTP = 'SMTP',
  GMAIL = 'GMAIL',
  BREVO = 'BREVO',
  RESEND = 'RESEND',
  AMAZON_SES = 'AMAZON_SES',
  SENDGRID = 'SENDGRID',
  MAILGUN = 'MAILGUN',
}

@Entity('email_configs')
export class EmailConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EmailProvider,
    default: EmailProvider.SMTP,
  })
  provider: EmailProvider;

  @Column({ type: 'varchar', length: 255, default: 'smtp.gmail.com' })
  smtp_host: string;

  @Column({ type: 'int', default: 587 })
  smtp_port: number;

  @Column({ type: 'boolean', default: false })
  smtp_secure: boolean;

  @Column({ type: 'varchar', length: 255, default: '' })
  smtp_user: string;

  @Column({ type: 'text', default: '' })
  smtp_password: string;

  @Column({ type: 'varchar', length: 255, default: 'noreply@likora.co' })
  from_email: string;

  @Column({ type: 'varchar', length: 255, default: 'Likora App & Delivery' })
  from_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reply_to?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // --- Feature Flags por Funcionalidad ---
  @Column({ type: 'boolean', default: true })
  enable_forgot_password: boolean;

  @Column({ type: 'boolean', default: false })
  enable_kyc_approved: boolean;

  @Column({ type: 'boolean', default: false })
  enable_kyc_rejected: boolean;

  @Column({ type: 'boolean', default: false })
  enable_order_confirmation: boolean;

  @Column({ type: 'boolean', default: false })
  enable_order_dispatch: boolean;

  @Column({ type: 'boolean', default: false })
  enable_welcome_signup: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
