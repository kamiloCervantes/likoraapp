import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../core/services/api_client.dart';
import '../../data/mocks/mock_repositories.dart';
import '../../data/models/category_model.dart';
import '../../data/models/product_model.dart';

class SearchResult {
  final List<ProductModel> products;
  final bool matchedInSelectedStore;
  final bool expandedToOtherStores;
  final String? nearestStoreName;
  final String? nearestStoreDistance;

  SearchResult({
    required this.products,
    required this.matchedInSelectedStore,
    required this.expandedToOtherStores,
    this.nearestStoreName,
    this.nearestStoreDistance,
  });
}

class CatalogRepository {
  Future<List<CategoryModel>> getCategories({String? storeId}) async {
    try {
      final endpoint = (storeId != null && storeId.isNotEmpty)
          ? '/categories?store_id=$storeId'
          : '/categories';
      final res = await ApiClient.get(endpoint);
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] is List) {
          final data = body['data'] as List;
          final categories = data.map((json) => CategoryModel.fromJson(json)).toList();
          if (categories.isNotEmpty) {
            debugPrint('✅ [CatalogRepository] ${categories.length} categorías cargadas desde la API.');
            return categories;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ [CatalogRepository] Error al obtener categorías de la API: $e');
    }
    debugPrint('ℹ️ [CatalogRepository] Usando categorías mock de respaldo.');
    return MockRepositories.fetchCategories();
  }

  Future<List<ProductModel>> getProducts({
    String? storeId,
    String? categoryId,
    String? subcategoryId,
    bool? isFeatured,
    bool? isOffer,
    String? query,
    int page = 1,
    int limit = 50,
    String? sortBy,
  }) async {
    try {
      final params = <String>[];
      params.add('page=$page');
      params.add('limit=$limit');
      if (storeId != null && storeId.isNotEmpty) {
        params.add('store_id=$storeId');
      }
      if (categoryId != null && categoryId.isNotEmpty) {
        params.add('category_id=$categoryId');
      }
      if (subcategoryId != null && subcategoryId.isNotEmpty) {
        params.add('subcategory_id=$subcategoryId');
      }
      if (isFeatured != null) {
        params.add('is_featured=$isFeatured');
      }
      if (isOffer != null) {
        params.add('is_offer=$isOffer');
      }
      if (query != null && query.isNotEmpty) {
        params.add('q=${Uri.encodeComponent(query)}');
      }
      if (sortBy != null && sortBy.isNotEmpty) {
        params.add('sort=$sortBy');
      }

      final queryString = params.isNotEmpty ? '?${params.join('&')}' : '';
      final res = await ApiClient.get('/products$queryString');

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] is List) {
          final data = body['data'] as List;
          final products = data.map((json) => ProductModel.fromJson(json)).toList();
          if (products.isNotEmpty) {
            debugPrint('✅ [CatalogRepository] ${products.length} productos cargados desde la API.');
            return products;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ [CatalogRepository] Error al obtener productos de la API: $e');
    }

    debugPrint('ℹ️ [CatalogRepository] Usando productos mock de respaldo.');
    return MockRepositories.fetchProducts();
  }

  Future<ProductModel?> getProductById(String id) async {
    try {
      final res = await ApiClient.get('/products/$id');
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] != null) {
          return ProductModel.fromJson(body['data']);
        }
      }
    } catch (e) {
      debugPrint('⚠️ [CatalogRepository] Error al obtener producto por ID: $e');
    }
    return null;
  }

  Future<SearchResult> searchProducts({
    required String query,
    String? storeId,
    double? userLat,
    double? userLng,
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final params = <String>[];
      params.add('q=${Uri.encodeComponent(query)}');
      params.add('page=$page');
      params.add('limit=$limit');
      if (storeId != null && storeId.isNotEmpty) {
        params.add('store_id=$storeId');
      }
      if (userLat != null && userLng != null) {
        params.add('user_lat=$userLat');
        params.add('user_lng=$userLng');
      }

      final queryString = '?${params.join('&')}';
      final res = await ApiClient.get('/products/search$queryString');

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final meta = body['meta'] ?? {};
        if (body['data'] is List) {
          final data = body['data'] as List;
          final products = data.map((json) => ProductModel.fromJson(json)).toList();
          return SearchResult(
            products: products,
            matchedInSelectedStore: meta['matched_in_selected_store'] == true,
            expandedToOtherStores: meta['expanded_to_other_stores'] == true,
            nearestStoreName: meta['nearest_store_name'],
            nearestStoreDistance: meta['nearest_store_distance'],
          );
        }
      }
    } catch (e) {
      debugPrint('⚠️ [CatalogRepository] Error en búsqueda de productos en la API: $e');
    }

    // Mock fallback
    final allMock = await MockRepositories.fetchProducts();
    final lowerQ = query.toLowerCase();
    final filtered = allMock.where((p) =>
      p.title.toLowerCase().contains(lowerQ) ||
      p.description.toLowerCase().contains(lowerQ)
    ).toList();

    return SearchResult(
      products: filtered,
      matchedInSelectedStore: true,
      expandedToOtherStores: false,
    );
  }
}
