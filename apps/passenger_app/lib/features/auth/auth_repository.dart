import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../core/services/api_client.dart';
import 'package:core_models/core_models.dart';

class AuthRepository {
  Future<Map<String, dynamic>> loginWithEmail(String email, String password) async {
    debugPrint('🚀 [AuthRepository] Iniciando login para: $email');
    try {
      final res = await ApiClient.post('/auth/login', body: {
        'email': email.trim(),
        'password': password,
        'app_source': 'CONSUMER_APP',
      });

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        ApiClient.setTokens(
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
        );
        debugPrint('🎉 [AuthRepository] Login exitoso para el usuario: ${data['user']?['email']}');
        return {'success': true, 'user': User.fromJson(data['user'])};
      } else {
        final err = jsonDecode(res.body);
        final msg = err['message'] is List ? (err['message'] as List).join(', ') : err['message'];
        debugPrint('⚠️ [AuthRepository] Error en login: $msg');
        return {'success': false, 'error': msg ?? 'Credenciales incorrectas'};
      }
    } catch (e) {
      debugPrint('❌ [AuthRepository] Excepción de conexión en login: $e');
      return {'success': false, 'error': 'No se pudo conectar con el servidor ($e)'};
    }
  }

  Future<Map<String, dynamic>> registerWithEmail({
    required String email,
    required String password,
    required String displayName,
    String? phoneNumber,
    String? birthDate,
  }) async {
    debugPrint('🚀 [AuthRepository] Iniciando registro de usuario: $email ($displayName)');
    try {
      final body = {
        'email': email.trim(),
        'password': password,
        'display_name': displayName.trim(),
        'app_source': 'CONSUMER_APP',
      };
      if (phoneNumber != null && phoneNumber.isNotEmpty) body['phone_number'] = phoneNumber;
      if (birthDate != null && birthDate.isNotEmpty) body['birth_date'] = birthDate;

      final res = await ApiClient.post('/auth/register', body: body);

      if (res.statusCode == 201) {
        final data = jsonDecode(res.body);
        ApiClient.setTokens(
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
        );
        debugPrint('🎉 [AuthRepository] Registro exitoso! Usuario creado en DB: ${data['user']?['id']}');
        return {'success': true, 'user': User.fromJson(data['user'])};
      } else {
        final err = jsonDecode(res.body);
        final msg = err['message'] is List ? (err['message'] as List).join(', ') : err['message'];
        debugPrint('⚠️ [AuthRepository] Error en registro de la API: $msg');
        return {'success': false, 'error': msg ?? 'Error al registrarse'};
      }
    } catch (e) {
      debugPrint('❌ [AuthRepository] Excepción de conexión en registro: $e');
      return {'success': false, 'error': 'Error de conexión con la API: $e'};
    }
  }
}
