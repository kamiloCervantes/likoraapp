import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../data/models/category_model.dart';
import '../../data/models/product_model.dart';

class CatalogRepository {
  final String baseUrl;

  CatalogRepository({this.baseUrl = 'http://localhost:3000/api/v1'});

  Future<List<CategoryModel>> getCategories() async {
    try {
      final res = await http.get(Uri.parse('/categories'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'] as List;
        return data.map((json) => CategoryModel.fromJson(json)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<List<ProductModel>> searchProducts({
    String? query,
    String? categoryId,
    int page = 1,
    int limit = 20,
    String? sortBy,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (query != null && query.isNotEmpty) queryParams['q'] = query;
      if (categoryId != null && categoryId.isNotEmpty) queryParams['categoryId'] = categoryId;
      if (sortBy != null) queryParams['sortBy'] = sortBy;

      final uri = Uri.parse('/products').replace(queryParameters: queryParams);
      final res = await http.get(uri);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'] as List;
        return data.map((json) => ProductModel.fromJson(json)).toList();
      }
    } catch (_) {}
    return [];
  }
}
