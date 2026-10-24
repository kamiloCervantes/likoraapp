import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import '../../core/services/api_client.dart';
import '../../data/models/store_model.dart';

class NearestStoreResult {
  final StoreModel nearestStore;
  final List<StoreModel> stores;

  NearestStoreResult({
    required this.nearestStore,
    required this.stores,
  });
}

class StoreRepository {
  // Cálculo de Haversine local en caso de desconexión o soporte offline
  static double calculateHaversineDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double r = 6371.0; // Radio de la Tierra en km
    final double dLat = (lat2 - lat1) * math.pi / 180.0;
    final double dLon = (lon2 - lon1) * math.pi / 180.0;
    final double a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(lat1 * math.pi / 180.0) *
            math.cos(lat2 * math.pi / 180.0) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return double.parse((r * c).toStringAsFixed(2));
  }

  Future<List<StoreModel>> getAllStores() async {
    try {
      final res = await ApiClient.get('/stores');
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] is List) {
          final list = body['data'] as List;
          return list.map((json) => StoreModel.fromJson(json)).toList();
        }
      }
    } catch (e) {
      debugPrint('⚠️ [StoreRepository] Error al obtener lista de tiendas: $e');
    }
    return _getFallbackStores();
  }

  Future<NearestStoreResult?> getNearestStore({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final res = await ApiClient.get('/stores/nearest?lat=$latitude&lng=$longitude');
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] != null && body['data']['nearest_store'] != null) {
          final nearestJson = body['data']['nearest_store'];
          final nearest = StoreModel.fromJson(nearestJson);

          final List<StoreModel> list = [];
          if (body['data']['stores'] is List) {
            final storesJson = body['data']['stores'] as List;
            for (var item in storesJson) {
              list.add(StoreModel.fromJson(item));
            }
          }

          debugPrint('✅ [StoreRepository] Tienda más cercana identificada: ${nearest.name} (${nearest.distanceFormatted})');
          return NearestStoreResult(nearestStore: nearest, stores: list);
        }
      }
    } catch (e) {
      debugPrint('⚠️ [StoreRepository] Error al consultar tienda más cercana de la API: $e');
    }

    // Fallback: calcular usando el algoritmo de Haversine en el cliente
    debugPrint('ℹ️ [StoreRepository] Calculando tienda más cercana mediante Haversine cliente.');
    final allStores = await getAllStores();
    if (allStores.isEmpty) return null;

    final storesWithDist = allStores.map((store) {
      final dist = calculateHaversineDistance(latitude, longitude, store.latitude, store.longitude);
      final distFormatted = dist < 1.0 ? '${(dist * 1000).round()} m' : '${dist.toStringAsFixed(1)} km';
      final withinCoverage = dist <= store.coverageRadiusKm;
      return StoreModel(
        id: store.id,
        name: store.name,
        slug: store.slug,
        code: store.code,
        description: store.description,
        address: store.address,
        city: store.city,
        latitude: store.latitude,
        longitude: store.longitude,
        coverageRadiusKm: store.coverageRadiusKm,
        openingTime: store.openingTime,
        closingTime: store.closingTime,
        posType: store.posType,
        isActive: store.isActive,
        isMain: store.isMain,
        distanceKm: dist,
        distanceFormatted: distFormatted,
        isWithinCoverage: withinCoverage,
      );
    }).toList();

    storesWithDist.sort((a, b) => (a.distanceKm ?? 0.0).compareTo(b.distanceKm ?? 0.0));
    return NearestStoreResult(nearestStore: storesWithDist.first, stores: storesWithDist);
  }

  List<StoreModel> _getFallbackStores() {
    return [
      StoreModel(
        id: '3ea32522-c707-4f18-b875-f689c7c815f2',
        name: 'Likora Boutique & Lounge - El Poblado',
        slug: 'likora-boutique-lounge-el-poblado',
        code: 'POS-MED-POB-01',
        description: 'Tienda flagship principal y showroom de destilados premium.',
        address: 'Cra. 43A # 5A-113, El Poblado',
        city: 'Medellín',
        latitude: 6.2085710,
        longitude: -75.5684340,
        coverageRadiusKm: 6.0,
        openingTime: '10:00',
        closingTime: '02:00',
        posType: 'physical_store',
        isMain: true,
      ),
      StoreModel(
        id: '040435f8-e5de-47fd-83b6-4f7441386c18',
        name: 'Likora Express - Laureles',
        slug: 'likora-express-laureles',
        code: 'POS-MED-LAU-02',
        description: 'Punto exprés en zona rosa Laureles con cervezas frías y rones.',
        address: 'Circular 73B # 39B-12, Laureles',
        city: 'Medellín',
        latitude: 6.2442030,
        longitude: -75.5925820,
        coverageRadiusKm: 4.5,
        openingTime: '11:00',
        closingTime: '03:00',
        posType: 'physical_store',
      ),
      StoreModel(
        id: '026ce57b-9786-405f-a9d0-d9bff97ff520',
        name: 'Likora 24/7 Delivery Hub - Belén / Guayabal',
        slug: 'likora-24-7-delivery-hub-belen-guayabal',
        code: 'DS-MED-BEL-02',
        description: 'Hub logístico de atención ininterrumpida 24/7.',
        address: 'Cra. 65 # 25-80, Guayabal',
        city: 'Medellín',
        latitude: 6.2251400,
        longitude: -75.5832100,
        coverageRadiusKm: 7.5,
        openingTime: '00:00',
        closingTime: '23:59',
        posType: 'dark_store',
      ),
      StoreModel(
        id: '4334c2d6-b414-483b-824f-ceacfe602d91',
        name: 'Likora Cava & Gran Reserva - Llanogrande',
        slug: 'likora-cava-gran-reserva-llanogrande',
        code: 'POS-ANT-LLA-01',
        description: 'Boutique campestre y cava de añadas históricas en Oriente.',
        address: 'Km 8 Vía Don Diego - Llanogrande',
        city: 'Rionegro',
        latitude: 6.1345200,
        longitude: -75.4298100,
        coverageRadiusKm: 12.0,
        openingTime: '11:00',
        closingTime: '23:00',
        posType: 'physical_store',
      ),
    ];
  }
}
