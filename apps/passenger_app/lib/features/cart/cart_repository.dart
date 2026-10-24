import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../core/services/api_client.dart';

class CartCostSummary {
  final double subtotal;
  final double tax;
  final double deliveryFee;
  final double total;
  final int totalItems;

  CartCostSummary({
    required this.subtotal,
    required this.tax,
    required this.deliveryFee,
    required this.total,
    required this.totalItems,
  });

  factory CartCostSummary.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      if (v is String) return double.tryParse(v) ?? 0.0;
      return 0.0;
    }

    return CartCostSummary(
      subtotal: parseDouble(json['subtotal']),
      tax: parseDouble(json['tax']),
      deliveryFee: parseDouble(json['delivery_fee'] ?? json['deliveryFee']),
      total: parseDouble(json['total']),
      totalItems: (json['total_items'] ?? json['totalItems'] as num?)?.toInt() ?? 0,
    );
  }
}

class CartRepository {
  Future<Map<String, dynamic>?> getCart() async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.get('/cart');
        if (res.statusCode == 200) {
          final body = jsonDecode(res.body);
          return body['data'];
        }
      }
    } catch (e) {
      debugPrint('⚠️ [CartRepository] Error al obtener carrito: ');
    }
    return null;
  }

  Future<bool> addItem(String productId, int quantity) async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.post(
          '/cart/items',
          body: {
            'productId': productId,
            'quantity': quantity,
          },
        );
        final success = res.statusCode == 200 || res.statusCode == 201;
        debugPrint('🛒 [CartRepository] addItem API status: ');
        return success;
      }
    } catch (e) {
      debugPrint('⚠️ [CartRepository] Error al agregar producto al carrito: ');
    }
    return false;
  }

  Future<bool> updateItemQuantity(String itemId, int quantity) async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.put(
          '/cart/items/',
          body: {'quantity': quantity},
        );
        return res.statusCode == 200;
      }
    } catch (e) {
      debugPrint('⚠️ [CartRepository] Error al actualizar cantidad: ');
    }
    return false;
  }

  Future<bool> removeItem(String itemId) async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.delete('/cart/items/');
        return res.statusCode == 200;
      }
    } catch (e) {
      debugPrint('⚠️ [CartRepository] Error al eliminar item del carrito: ');
    }
    return false;
  }

  Future<bool> clearCart() async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.delete('/cart/clear');
        return res.statusCode == 200;
      }
    } catch (e) {
      debugPrint('⚠️ [CartRepository] Error al vaciar carrito: ');
    }
    return false;
  }
}
