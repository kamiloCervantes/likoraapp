import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/user_model.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/order_model.dart';
import '../models/address_model.dart';

class MockRepositories {
  static Future<UserModel> fetchUser() async {
    try {
      final jsonString = await rootBundle.loadString('lib/data/mocks/mock_user.json');
      final Map<String, dynamic> data = json.decode(jsonString);
      return UserModel.fromJson(data);
    } catch (_) {
      return UserModel(
        id: 'usr-5501',
        name: 'Sofia Ramirez',
        email: 'sofia.ramirez@email.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
        documentId: '1098765432',
        dateOfBirth: '1994-05-18',
        preferredStore: 'Likora Central - Av. Principal #45-12',
        role: UserRole.client,
      );
    }
  }

  static Future<List<ProductModel>> fetchProducts() async {
    try {
      final jsonString = await rootBundle.loadString('lib/data/mocks/mock_products.json');
      final List<dynamic> data = json.decode(jsonString);
      return data.map((item) => ProductModel.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<List<CategoryModel>> fetchCategories() async {
    try {
      final jsonString = await rootBundle.loadString('lib/data/mocks/mock_categories.json');
      final List<dynamic> data = json.decode(jsonString);
      return data.map((item) => CategoryModel.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<List<OrderModel>> fetchOrders() async {
    try {
      final jsonString = await rootBundle.loadString('lib/data/mocks/mock_orders.json');
      final List<dynamic> data = json.decode(jsonString);
      return data.map((item) => OrderModel.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<List<AddressModel>> fetchAddresses() async {
    try {
      final jsonString = await rootBundle.loadString('lib/data/mocks/mock_addresses.json');
      final List<dynamic> data = json.decode(jsonString);
      return data.map((item) => AddressModel.fromJson(item)).toList();
    } catch (_) {
      return [];
    }
  }
}
