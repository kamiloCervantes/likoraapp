import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../core/services/api_client.dart';

class StripeConfig {
  final String publishableKey;
  final String currency;
  final bool isLiveMode;
  final bool isActive;
  final String merchantName;
  final String statementDescriptor;

  StripeConfig({
    required this.publishableKey,
    required this.currency,
    required this.isLiveMode,
    required this.isActive,
    required this.merchantName,
    required this.statementDescriptor,
  });

  factory StripeConfig.fromJson(Map<String, dynamic> json) {
    return StripeConfig(
      publishableKey: json['publishable_key'] ?? '',
      currency: json['currency'] ?? 'USD',
      isLiveMode: json['is_live_mode'] == true,
      isActive: json['is_active'] != false,
      merchantName: json['merchant_name'] ?? 'Likora Liquors',
      statementDescriptor: json['statement_descriptor'] ?? 'LIKORA',
    );
  }

  factory StripeConfig.fallback() {
    return StripeConfig(
      publishableKey: 'pk_test_51LikoraTestPublishableKey2026demoXYZ987',
      currency: 'USD',
      isLiveMode: false,
      isActive: true,
      merchantName: 'Likora Liquors & Spirits',
      statementDescriptor: 'LIKORA',
    );
  }
}

class StripePaymentResult {
  final bool success;
  final String? paymentIntentId;
  final String? clientSecret;
  final String? status;
  final String? receiptUrl;
  final String? errorMessage;

  StripePaymentResult({
    required this.success,
    this.paymentIntentId,
    this.clientSecret,
    this.status,
    this.receiptUrl,
    this.errorMessage,
  });
}

class StripeService {
  static StripeConfig? _cachedConfig;

  /// Fetches public Stripe configuration managed from the Admin web panel
  static Future<StripeConfig> getConfig({bool forceRefresh = false}) async {
    if (_cachedConfig != null && !forceRefresh) {
      return _cachedConfig!;
    }

    try {
      final res = await ApiClient.get('/config/payments');
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['data'] != null) {
          _cachedConfig = StripeConfig.fromJson(body['data']);
          debugPrint('💳 [StripeService] Configuración Stripe cargada desde Admin: ${_cachedConfig?.publishableKey.substring(0, 12)}... [Modo: ${_cachedConfig?.isLiveMode == true ? "Live" : "Test"}]');
          return _cachedConfig!;
        }
      }
    } catch (e) {
      debugPrint('⚠️ [StripeService] Error obteniendo configuración de Stripe del servidor: $e');
    }

    _cachedConfig = StripeConfig.fallback();
    return _cachedConfig!;
  }

  /// Creates a PaymentIntent on the backend using the configured Stripe Secret Key
  static Future<StripePaymentResult> createPaymentIntent({
    required double amount,
    String? currency,
    String? customerEmail,
    String? orderId,
    String? userId,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final res = await ApiClient.post(
        '/payments/create-intent',
        body: {
          'amount': amount,
          if (currency != null) 'currency': currency,
          if (customerEmail != null) 'customer_email': customerEmail,
          if (orderId != null) 'order_id': orderId,
          if (userId != null) 'user_id': userId,
          if (metadata != null) 'metadata': metadata,
        },
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = json.decode(res.body);
        final data = body['data'];
        return StripePaymentResult(
          success: true,
          paymentIntentId: data['payment_intent_id'],
          clientSecret: data['client_secret'],
          status: data['status'],
        );
      } else {
        final body = json.decode(res.body);
        final msg = body['message'] ?? 'Error desconocido al crear orden de pago.';
        return StripePaymentResult(
          success: false,
          errorMessage: msg is List ? msg.join(', ') : msg.toString(),
        );
      }
    } catch (e) {
      debugPrint('❌ [StripeService] Error creando PaymentIntent: $e');
      return StripePaymentResult(
        success: false,
        errorMessage: 'Error de conexión con la pasarela de pagos Stripe: $e',
      );
    }
  }

  /// Confirms the payment intent with Stripe and logs the transaction
  static Future<StripePaymentResult> confirmPayment({
    required String paymentIntentId,
    required String cardLast4,
    required String brand,
    required String customerName,
  }) async {
    try {
      final res = await ApiClient.post(
        '/payments/confirm',
        body: {
          'payment_intent_id': paymentIntentId,
          'card_last4': cardLast4,
          'brand': brand,
          'customer_name': customerName,
        },
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = json.decode(res.body);
        final data = body['data'];
        return StripePaymentResult(
          success: true,
          paymentIntentId: data['payment_intent_id'] ?? paymentIntentId,
          status: data['status'] ?? 'succeeded',
          receiptUrl: data['receipt_url'],
        );
      } else {
        final body = json.decode(res.body);
        final msg = body['message'] ?? 'Fallo al confirmar el pago en Stripe.';
        return StripePaymentResult(
          success: false,
          errorMessage: msg is List ? msg.join(', ') : msg.toString(),
        );
      }
    } catch (e) {
      debugPrint('❌ [StripeService] Error confirmando pago: $e');
      return StripePaymentResult(
        success: false,
        errorMessage: 'Error al autorizar el cobro con la tarjeta: $e',
      );
    }
  }
}
