import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../data/models/address_model.dart';
import '../../core/services/api_client.dart';

class AddressRepository {
  final ApiClient? apiClient;
  final String baseUrl;

  AddressRepository({this.apiClient, this.baseUrl = 'http://localhost:3000/api/v1'});

  Future<List<AddressModel>> getAddresses() async {
    try {
      final res = await http.get(Uri.parse('/users/me/addresses'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'] as List;
        return data.map((json) => AddressModel.fromJson(json)).toList();
      }
    } catch (_) {}
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
      final res = await http.post(
        Uri.parse('/users/me/addresses'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'alias': alias,
          'street_address': streetAddress,
          'reference': reference,
          'city': city,
          'latitude': latitude,
          'longitude': longitude,
          'is_active': isActive,
        }),
      );
      if (res.statusCode == 201) {
        final data = jsonDecode(res.body)['data'];
        return AddressModel.fromJson(data);
      }
    } catch (_) {}
    return null;
  }

  Future<bool> setActiveAddress(String addressId) async {
    try {
      final res = await http.patch(Uri.parse('/users/me/addresses//activate'));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteAddress(String addressId) async {
    try {
      final res = await http.delete(Uri.parse('/users/me/addresses/'));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
