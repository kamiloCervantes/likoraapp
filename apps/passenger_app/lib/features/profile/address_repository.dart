import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../data/models/address_model.dart';
import '../../core/services/api_client.dart';

class AddressRepository {
  Future<List<AddressModel>> getAddresses() async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.get('/users/me/addresses');
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body)['data'] as List;
          return data.map((json) => AddressModel.fromJson(json)).toList();
        }
      }
    } catch (e) {
      debugPrint('⚠️ [AddressRepository] Error al obtener direcciones de la API: $e');
    }
    return [];
  }

  Future<AddressModel?> createAddress({
    required String alias,
    required String streetAddress,
    String? reference,
    required String city,
    double? latitude,
    double? longitude,
    bool isActive = false,
  }) async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.post(
          '/users/me/addresses',
          body: {
            'alias': alias,
            'street_address': streetAddress,
            'reference': reference,
            'city': city,
            'latitude': latitude ?? 19.4326,
            'longitude': longitude ?? -99.1332,
            'setActive': isActive,
          },
        );
        if (res.statusCode == 201) {
          final data = jsonDecode(res.body)['data'];
          return AddressModel.fromJson(data);
        }
      }
    } catch (e) {
      debugPrint('⚠️ [AddressRepository] Error al crear dirección en API: $e');
    }
    return null;
  }

  Future<AddressModel?> updateAddress({
    required String id,
    String? alias,
    String? streetAddress,
    String? reference,
    String? city,
    double? latitude,
    double? longitude,
    bool? isActive,
  }) async {
    try {
      if (ApiClient.isAuthenticated) {
        final body = <String, dynamic>{};
        if (alias != null) body['alias'] = alias;
        if (streetAddress != null) body['street_address'] = streetAddress;
        if (reference != null) body['reference'] = reference;
        if (city != null) body['city'] = city;
        if (latitude != null) body['latitude'] = latitude;
        if (longitude != null) body['longitude'] = longitude;
        if (isActive != null) body['is_active'] = isActive;

        final res = await ApiClient.put('/users/me/addresses/$id', body: body);
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body)['data'];
          return AddressModel.fromJson(data);
        }
      }
    } catch (e) {
      debugPrint('⚠️ [AddressRepository] Error al actualizar dirección en API: $e');
    }
    return null;
  }

  Future<bool> setActiveAddress(String addressId) async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.patch('/users/me/addresses/$addressId/activate');
        return res.statusCode == 200;
      }
    } catch (e) {
      debugPrint('⚠️ [AddressRepository] Error al activar dirección en API: $e');
    }
    return false;
  }

  Future<bool> deleteAddress(String addressId) async {
    try {
      if (ApiClient.isAuthenticated) {
        final res = await ApiClient.delete('/users/me/addresses/$addressId');
        return res.statusCode == 200 || res.statusCode == 204;
      }
    } catch (e) {
      debugPrint('⚠️ [AddressRepository] Error al eliminar dirección en API: $e');
    }
    return false;
  }
}
