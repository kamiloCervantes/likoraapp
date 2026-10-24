import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../core/services/api_client.dart';
import '../../data/models/promotion_model.dart';

class PromotionRepository {
  Future<List<PromotionModel>> getPromotions({String? storeId}) async {
    try {
      final endpoint = (storeId != null && storeId.isNotEmpty)
          ? '/promotions?store_id=$storeId'
          : '/promotions';
      final res = await ApiClient.get(endpoint);
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] is List) {
          final data = body['data'] as List;
          final promos = data.map((json) => PromotionModel.fromJson(json)).toList();
          if (promos.isNotEmpty) {
            debugPrint('🎉 [PromotionRepository] ${promos.length} promociones activas cargadas desde la API.');
            return promos;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ [PromotionRepository] Error cargando promociones de la API: $e');
    }

    debugPrint('ℹ️ [PromotionRepository] Usando promociones de respaldo.');
    return PromotionModel.fallbacks();
  }
}
