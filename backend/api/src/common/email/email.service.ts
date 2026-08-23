import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailConfig, EmailProvider } from './entities/email-config.entity';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private currentConfig: EmailConfig | null = null;

  constructor(
    @InjectRepository(EmailConfig)
    private readonly configRepo: Repository<EmailConfig>,
  ) {}

  async onModuleInit() {
    await this.initTransporter();
  }

  async initTransporter() {
    try {
      let config = await this.configRepo.findOne({ where: { is_active: true } });
      if (!config) {
        config = this.configRepo.create({
          provider: EmailProvider.SMTP,
          smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
          smtp_port: parseInt(process.env.SMTP_PORT || '587', 10),
          smtp_secure: process.env.SMTP_SECURE === 'true',
          smtp_user: process.env.SMTP_USER || '',
          smtp_password: process.env.SMTP_PASSWORD || '',
          from_email: process.env.SMTP_FROM_EMAIL || 'notificaciones@likora.app',
          from_name: process.env.SMTP_FROM_NAME || 'Likora Delivery & App',
          reply_to: process.env.SMTP_REPLY_TO || 'soporte@likora.app',
          is_active: true,
          enable_forgot_password: true,
          enable_kyc_approved: false,
          enable_kyc_rejected: false,
          enable_order_confirmation: false,
          enable_order_dispatch: false,
          enable_welcome_signup: false,
        });
        await this.configRepo.save(config);
      }

      this.currentConfig = config;

      if (config.smtp_host && config.smtp_user && config.smtp_password) {
        this.transporter = nodemailer.createTransport({
          host: config.smtp_host,
          port: config.smtp_port,
          secure: config.smtp_secure,
          auth: {
            user: config.smtp_user,
            pass: config.smtp_password,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        this.logger.log(`📧 Transporter SMTP inicializado para: ${config.smtp_host}:${config.smtp_port}`);
      } else {
        this.transporter = null;
        this.logger.warn('⚠️ Transporter SMTP en espera de credenciales en base de datos.');
      }
    } catch (e: any) {
      this.logger.error(`❌ Error al inicializar transporter SMTP: ${e.message}`, e.stack);
    }
  }

  async getConfig(): Promise<any> {
    const config = await this.configRepo.findOne({ where: { is_active: true } });
    if (!config) return null;
    return {
      ...config,
      smtp_password: config.smtp_password ? '••••••••••••' : '',
      has_password: !!config.smtp_password,
    };
  }

  async updateConfig(dto: Partial<EmailConfig>): Promise<any> {
    let config = await this.configRepo.findOne({ where: { is_active: true } });
    if (!config) {
      config = this.configRepo.create(dto);
    } else {
      if (!dto.smtp_password || dto.smtp_password.includes('••••')) {
        delete dto.smtp_password;
      }
      Object.assign(config, dto);
    }

    await this.configRepo.save(config);
    await this.initTransporter();
    return this.getConfig();
  }

  async testConnection(toEmail: string, customConfig?: Partial<EmailConfig>): Promise<{ success: boolean; message: string }> {
    let testTransporter = this.transporter;

    if (customConfig && customConfig.smtp_host) {
      let pwd = customConfig.smtp_password;
      if (!pwd || pwd.includes('••••')) {
        const existing = await this.configRepo.findOne({ where: { is_active: true } });
        pwd = existing?.smtp_password || '';
      }

      testTransporter = nodemailer.createTransport({
        host: customConfig.smtp_host,
        port: Number(customConfig.smtp_port) || 587,
        secure: customConfig.smtp_secure === true,
        auth: {
          user: customConfig.smtp_user || '',
          pass: pwd,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    if (!testTransporter) {
      throw new BadRequestException('El servicio SMTP no está configurado. Ingrese host, usuario y contraseña.');
    }

    try {
      this.logger.log(`🧪 Verificando handshake SMTP...`);
      await testTransporter.verify();
      this.logger.log(`✅ Handshake SMTP exitoso. Enviando correo de prueba a: ${toEmail}`);

      const fromName = customConfig?.from_name || this.currentConfig?.from_name || 'Likora Delivery';
      const fromEmail = customConfig?.from_email || this.currentConfig?.from_email || 'notificaciones@likora.app';

      const info = await testTransporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject: '🚀 Likora - Verificación Exitosa del Servicio de Correo SMTP',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #f0f6fc; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #30363d;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #FF6B00 0%, #D81B60 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Likora</span>
              <p style="color: #8b949e; font-size: 14px; margin-top: 4px;">Plataforma de Licores & Delivery en Minutos</p>
            </div>
            <div style="background-color: #161b22; padding: 24px; border-radius: 8px; border-left: 4px solid #10b981;">
              <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">✅ ¡Conexión SMTP Establecida con Éxito!</h2>
              <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6;">
                Este es un mensaje de prueba generado automáticamente desde el <strong>Panel Administrativo de Likora</strong> para validar que el servicio global de notificaciones por correo electrónico se encuentra 100% operativo.
              </p>
              <table style="width: 100%; margin-top: 16px; font-size: 13px; color: #8b949e; border-collapse: collapse;">
                <tr><td style="padding: 6px 0;"><strong>Servidor:</strong></td><td style="color: #f0f6fc;">${customConfig?.smtp_host || this.currentConfig?.smtp_host}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Puerto:</strong></td><td style="color: #f0f6fc;">${customConfig?.smtp_port || this.currentConfig?.smtp_port}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Remitente:</strong></td><td style="color: #f0f6fc;">${fromEmail}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Fecha y Hora:</strong></td><td style="color: #f0f6fc;">${new Date().toLocaleString()}</td></tr>
              </table>
            </div>
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6e7681;">
              © ${new Date().getFullYear()} Likora App. Todos los derechos reservados.
            </div>
          </div>
        `,
      });

      return {
        success: true,
        message: `Correo de prueba enviado satisfactoriamente a ${toEmail} (ID: ${info.messageId})`,
      };
    } catch (e: any) {
      this.logger.error(`❌ Falló test SMTP: ${e.message}`);
      throw new BadRequestException(`Error en servidor SMTP: ${e.message}`);
    }
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    if (!this.transporter || !this.currentConfig) {
      this.logger.warn(`⚠️ Envío de correo omitido (SMTP no configurado) para: ${options.to}`);
      return false;
    }

    try {
      const fromName = this.currentConfig.from_name || 'Likora Delivery';
      const fromEmail = this.currentConfig.from_email || 'notificaciones@likora.app';
      const replyTo = options.replyTo || this.currentConfig.reply_to || fromEmail;

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: replyTo,
      });

      this.logger.log(`📨 Correo enviado a: ${options.to} | Asunto: "${options.subject}"`);
      return true;
    } catch (e: any) {
      this.logger.error(`❌ Error al enviar correo a ${options.to}: ${e.message}`);
      return false;
    }
  }

  /**
   * Envío de Código de Seguridad OTP para Recuperación de Contraseña
   */
  async sendPasswordResetOtpEmail(toEmail: string, userName: string, otpCode: string): Promise<boolean> {
    if (this.currentConfig && this.currentConfig.enable_forgot_password === false) {
      this.logger.log(`ℹ️ Envío de correo de recuperación de contraseña OMITIDO (Deshabilitado en Admin Config).`);
      return false;
    }

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0d1117; color: #f0f6fc; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #30363d;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF6B00 0%, #D81B60 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">Likora</h1>
          <p style="color: #8b949e; font-size: 14px; margin-top: 4px;">Seguridad de la Cuenta</p>
        </div>
        <div style="background-color: #161b22; padding: 32px 24px; border-radius: 12px; border-top: 4px solid #f59e0b; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">🔐</div>
          <h2 style="color: #ffffff; font-size: 22px; margin-top: 0; margin-bottom: 12px;">Recuperación de Contraseña</h2>
          <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Hola <strong>${userName}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta de Likora.
          </p>
          <p style="color: #8b949e; font-size: 13px; margin-bottom: 12px;">Tu código de seguridad temporal es:</p>
          <div style="display: inline-block; background-color: #0d1117; border: 2px solid #f59e0b; padding: 14px 28px; border-radius: 12px; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #f59e0b; font-family: monospace;">${otpCode}</span>
          </div>
          <p style="color: #8b949e; font-size: 13px; line-height: 1.5; margin: 0;">
            ⏳ Este código es de un solo uso y expirará en <strong>15 minutos</strong>.<br/>
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6e7681;">
          Likora App - Seguridad & Protección © ${new Date().getFullYear()}
        </div>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject: `🔑 ${otpCode} es tu código de recuperación de cuenta - Likora`,
      html,
    });
  }

  /**
   * Notificación KYC Aprobada (Sujeta a toggle en Admin)
   */
  async sendKycApprovedEmail(toEmail: string, userName: string, expiresAt: Date): Promise<boolean> {
    if (this.currentConfig && this.currentConfig.enable_kyc_approved === false) {
      this.logger.log(`ℹ️ Envío de correo KYC Aprobado OMITIDO (Deshabilitado en Admin Config).`);
      return false;
    }

    const formattedExpires = new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #f0f6fc; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #30363d;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF6B00 0%, #D81B60 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">Likora</h1>
          <p style="color: #8b949e; font-size: 14px; margin-top: 4px;">Tu licor favorito en minutos</p>
        </div>
        <div style="background-color: #161b22; padding: 28px; border-radius: 12px; border-top: 4px solid #10b981;">
          <h2 style="color: #10b981; font-size: 22px; text-align: center; margin-top: 0;">🎉 ¡Verificación de Identidad Aprobada!</h2>
          <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6;">
            Hola <strong>${userName}</strong>, tu documento de identidad y selfie han sido validados con éxito (+18).
          </p>
          <div style="background-color: #0d1117; border: 1px dashed #10b981; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #10b981; font-weight: bold; margin: 0; font-size: 15px;">✓ Estado: Mayor de Edad Verificado</p>
            <p style="color: #8b949e; font-size: 13px; margin: 6px 0 0 0;">Vigencia activa para compras hasta las: <strong>${formattedExpires}</strong></p>
          </div>
          <p style="color: #c9d1d9; font-size: 14px;">Ya puedes completar tu compra inmediatamente desde la app.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6e7681;">
          Likora App © ${new Date().getFullYear()}
        </div>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject: '✅ ¡Tu Verificación de Identidad ha sido Aprobada! - Likora',
      html,
    });
  }

  /**
   * Notificación KYC Rechazada (Sujeta a toggle en Admin)
   */
  async sendKycRejectedEmail(toEmail: string, userName: string, reason: string, notes?: string): Promise<boolean> {
    if (this.currentConfig && this.currentConfig.enable_kyc_rejected === false) {
      this.logger.log(`ℹ️ Envío de correo KYC Rechazado OMITIDO (Deshabilitado en Admin Config).`);
      return false;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #f0f6fc; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #30363d;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF6B00 0%, #D81B60 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">Likora</h1>
          <p style="color: #8b949e; font-size: 14px; margin-top: 4px;">Tu licor favorito en minutos</p>
        </div>
        <div style="background-color: #161b22; padding: 28px; border-radius: 12px; border-top: 4px solid #ef4444;">
          <h2 style="color: #ef4444; font-size: 22px; text-align: center; margin-top: 0;">⚠️ Verificación de Identidad No Aprobada</h2>
          <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6;">
            Hola <strong>${userName}</strong>, tu solicitud de verificación no pudo ser aprobada:
          </p>
          <div style="background-color: #0d1117; border: 1px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #f87171; font-weight: bold; margin: 0; font-size: 15px;">Motivo: ${reason}</p>
            ${notes ? `<p style="color: #8b949e; font-size: 13px; margin: 8px 0 0 0;">Detalle: ${notes}</p>` : ''}
          </div>
          <p style="color: #c9d1d9; font-size: 14px;">
            Te invitamos a volver a capturar las fotografías asegurando buena iluminación y nitidez.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6e7681;">
          Likora App © ${new Date().getFullYear()}
        </div>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject: '⚠️ Información sobre tu Verificación de Identidad - Likora',
      html,
    });
  }
}
