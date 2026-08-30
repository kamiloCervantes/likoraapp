import 'dart:convert';
import 'package:http/http.dart' as http;

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
    return CartCostSummary(
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      deliveryFee: (json['delivery_fee'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      totalItems: (json['total_items'] as num?)?.toInt() ?? 0,
    );
  }
}

class CartRepository {
  final String baseUrl;

  CartRepository({this.baseUrl = 'http://localhost:3000/api/v1'});

  Future<Map<String, dynamic>?> getCart() async {
    try {
      final res = await http.get(Uri.parse('/cart'));
      if (res.statusCode == 200) {
        return jsonDecode(res.body)['data'];
      }
    } catch (_) {}
    return null;
  }

  Future<bool> addItem(String productId, int quantity) async {
    try {
      final res = await http.post(
        Uri.parse('/cart/items'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'product_id': productId, 'quantity': quantity}),
      );
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateItemQuantity(String itemId, int quantity) async {
    try {
      final res = await http.put(
        Uri.parse('/cart/items/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'quantity': quantity}),
      );
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> removeItem(String itemId) async {
    try {
      final res = await http.delete(Uri.parse('/cart/items/'));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> clearCart() async {
    try {
      final res = await http.delete(Uri.parse('/cart/clear'));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
