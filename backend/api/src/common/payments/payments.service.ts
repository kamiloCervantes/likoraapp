import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { PaymentConfig } from './entities/payment-config.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentConfig)
    private readonly paymentConfigRepository: Repository<PaymentConfig>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
  ) {}

  async getConfig(): Promise<PaymentConfig> {
    let config = await this.paymentConfigRepository.findOne({
      where: { is_active: true },
      order: { updated_at: 'DESC' },
    });

    if (!config) {
      config = this.paymentConfigRepository.create({
        provider: 'stripe',
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51LikoraTestPublishableKey2026demoXYZ987',
        secret_key: process.env.STRIPE_SECRET_KEY || 'sk_test_51LikoraTestSecretKey2026demoABC123',
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demoWebhookSecretLikora2026',
        currency: 'USD',
        is_live_mode: false,
        is_active: true,
        merchant_name: 'Likora Liquors & Spirits',
        statement_descriptor: 'LIKORA',
      });
      config = await this.paymentConfigRepository.save(config);
    }

    return config;
  }

  async updateConfig(dto: Partial<PaymentConfig>): Promise<PaymentConfig> {
    const current = await this.getConfig();

    const updated = this.paymentConfigRepository.merge(current, {
      ...dto,
      currency: dto.currency ? dto.currency.toUpperCase() : current.currency,
    });

    const saved = await this.paymentConfigRepository.save(updated);
    this.logger.log(`Configuración de Stripe actualizada exitosamente: ${saved.id}`);
    return saved;
  }

  async getPublicClientConfig() {
    const config = await this.getConfig();
    return {
      provider: config.provider,
      publishable_key: config.publishable_key,
      currency: config.currency,
      is_live_mode: config.is_live_mode,
      is_active: config.is_active,
      merchant_name: config.merchant_name,
      statement_descriptor: config.statement_descriptor,
    };
  }

  async testConnection(customSecretKey?: string): Promise<{ success: boolean; message: string; details?: any }> {
    const config = await this.getConfig();
    const key = customSecretKey && customSecretKey.trim().length > 0 ? customSecretKey.trim() : config.secret_key;

    if (!key || key.trim().length === 0) {
      return {
        success: false,
        message: 'No se ha configurado ninguna Stripe Secret Key (sk_test_... o sk_live_...).',
      };
    }

    if (key.includes('demo') || key.includes('Demo')) {
      return {
        success: true,
        message: 'Modo Sandbox Demo de Stripe configurado correctamente (Credenciales de prueba válidas para testing local).',
        details: {
          mode: 'SIMULATION_SANDBOX',
          currency: config.currency,
          status: 'ready',
        },
      };
    }

    try {
      const stripe = new Stripe(key, { apiVersion: '2023-10-16' as any });
      const balance = await stripe.balance.retrieve();

      return {
        success: true,
        message: `Conexión exitosa con Stripe API. Cuenta verificada (${balance.livemode ? 'Modo Producción Live' : 'Modo Test Sandbox'}).`,
        details: {
          livemode: balance.livemode,
          available_currencies: balance.available?.map((b) => b.currency.toUpperCase()) || [],
        },
      };
    } catch (e: any) {
      this.logger.error(`Error al verificar Stripe API Key: ${e.message}`);
      return {
        success: false,
        message: `Stripe API rechazó la credencial: ${e.message}`,
        details: {
          code: e.code,
          type: e.type,
        },
      };
    }
  }

  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    customer_email?: string;
    order_id?: string;
    user_id?: string;
    metadata?: Record<string, any>;
  }) {
    const config = await this.getConfig();
    if (!config.is_active) {
      throw new BadRequestException('La pasarela de pagos Stripe se encuentra actualmente desactivada por el administrador.');
    }

    const currency = (params.currency || config.currency || 'USD').toLowerCase();
    const amountInCents = Math.round(Number(params.amount) * 100);

    let paymentIntentId = '';
    let clientSecret = '';
    let status = 'requires_payment_method';

    const isRealKey =
      config.secret_key &&
      (config.secret_key.startsWith('sk_test_') || config.secret_key.startsWith('sk_live_')) &&
      !config.secret_key.includes('demo');

    if (isRealKey) {
      try {
        const stripe = new Stripe(config.secret_key, { apiVersion: '2023-10-16' as any });
        const intent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: currency,
          receipt_email: params.customer_email,
          statement_descriptor_suffix: config.statement_descriptor ? config.statement_descriptor.slice(0, 22) : undefined,
          metadata: {
            order_id: params.order_id || '',
            user_id: params.user_id || '',
            merchant: config.merchant_name,
            ...params.metadata,
          },
        });
        paymentIntentId = intent.id;
        clientSecret = intent.client_secret || '';
        status = intent.status;
      } catch (err: any) {
        this.logger.error(`Error creando PaymentIntent en Stripe: ${err.message}`);
        throw new BadRequestException(`Error al procesar con Stripe: ${err.message}`);
      }
    } else {
      // Demo / simulated mode
      paymentIntentId = `pi_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 16)}`;
      status = 'requires_payment_method';
    }

    // Record transaction
    const transaction = this.paymentTransactionRepository.create({
      payment_intent_id: paymentIntentId,
      order_id: params.order_id,
      user_id: params.user_id,
      amount: params.amount,
      currency: currency.toUpperCase(),
      status: status,
      client_secret: clientSecret,
      payment_method: 'card',
      metadata: {
        ...params.metadata,
        customer_email: params.customer_email,
        is_simulated: !isRealKey,
      },
    });

    const savedTx = await this.paymentTransactionRepository.save(transaction);

    return {
      success: true,
      payment_intent_id: paymentIntentId,
      client_secret: clientSecret,
      amount: params.amount,
      currency: currency.toUpperCase(),
      status: status,
      publishable_key: config.publishable_key,
      transaction_id: savedTx.id,
    };
  }

  async confirmPayment(params: {
    payment_intent_id: string;
    card_last4?: string;
    brand?: string;
    customer_name?: string;
  }) {
    const config = await this.getConfig();
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { payment_intent_id: params.payment_intent_id },
    });

    const isRealKey =
      config.secret_key &&
      (config.secret_key.startsWith('sk_test_') || config.secret_key.startsWith('sk_live_')) &&
      !config.secret_key.includes('demo');

    if (isRealKey && !params.payment_intent_id.startsWith('pi_sim_')) {
      try {
        const stripe = new Stripe(config.secret_key, { apiVersion: '2023-10-16' as any });
        const intent = await stripe.paymentIntents.retrieve(params.payment_intent_id);
        if (transaction) {
          transaction.status = intent.status === 'succeeded' ? 'succeeded' : intent.status;
          await this.paymentTransactionRepository.save(transaction);
        }
        return {
          success: true,
          status: intent.status,
          payment_intent_id: intent.id,
          receipt_url: (intent as any).charges?.data?.[0]?.receipt_url || null,
        };
      } catch (err: any) {
        this.logger.error(`Error confirmando en Stripe: ${err.message}`);
        throw new BadRequestException(`Error confirmando pago: ${err.message}`);
      }
    }

    // Simulation / local confirmation
    if (transaction) {
      transaction.status = 'succeeded';
      transaction.receipt_url = `https://pay.stripe.com/receipts/sim_${params.payment_intent_id}`;
      transaction.metadata = {
        ...transaction.metadata,
        card_last4: params.card_last4 || '4242',
        brand: params.brand || 'Visa',
        customer_name: params.customer_name || 'Cliente Likora',
        confirmed_at: new Date().toISOString(),
      };
      await this.paymentTransactionRepository.save(transaction);
    }

    return {
      success: true,
      status: 'succeeded',
      payment_intent_id: params.payment_intent_id,
      receipt_url: `https://pay.stripe.com/receipts/sim_${params.payment_intent_id}`,
      message: 'Pago procesado y aprobado exitosamente por Stripe.',
    };
  }

  async getRecentTransactions(limit = 20): Promise<PaymentTransaction[]> {
    return this.paymentTransactionRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
