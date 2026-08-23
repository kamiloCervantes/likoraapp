import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../core/services/api_client.dart';
import '../../core/config/app_config.dart';

class AuthRepository {
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    debugPrint('🚀 [AuthRepository] Intentando login con correo: $email');
    try {
      final response = await ApiClient.post('/auth/login', body: {
        'email': email.trim().toLowerCase(),
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final accessToken = data['access_token'];
        final refreshToken = data['refresh_token'];

        ApiClient.setTokens(
          accessToken: accessToken,
          refreshToken: refreshToken,
        );

        debugPrint('🎉 [AuthRepository] Login exitoso para usuario: ${data['user']?['display_name']} (${data['user']?['email']})');
        return {
          'success': true,
          'user': data['user'],
          'token': accessToken,
        };
      } else {
        final errorData = jsonDecode(response.body);
        final msg = errorData['message'] is List
            ? (errorData['message'] as List).join(', ')
            : errorData['message'];
        debugPrint('⚠️ [AuthRepository] Falló login [${response.statusCode}]: $msg');
        return {
          'success': false,
          'error': msg ?? 'Credenciales inválidas.',
        };
      }
    } catch (e) {
      debugPrint('❌ [AuthRepository] Excepción de conexión en login: $e');
      return {
        'success': false,
        'error': 'No se pudo conectar con el servidor de Likora: $e',
      };
    }
  }

  Future<Map<String, dynamic>> registerWithEmail({
    required String email,
    required String password,
    required String displayName,
    String? birthDate,
    String? phoneNumber,
  }) async {
    debugPrint('🚀 [AuthRepository] Registrando nuevo usuario: $displayName ($email)');
    try {
      final response = await ApiClient.post('/auth/register', body: {
        'display_name': displayName.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        if (birthDate != null && birthDate.isNotEmpty) 'birth_date': birthDate,
        if (phoneNumber != null && phoneNumber.isNotEmpty) 'phone_number': phoneNumber.trim(),
      });

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        ApiClient.setTokens(
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
        );
        debugPrint('🎉 [AuthRepository] Registro exitoso para: $email');
        return {
          'success': true,
          'user': data['user'],
          'token': data['access_token'],
        };
      } else {
        final errorData = jsonDecode(response.body);
        final msg = errorData['message'] is List
            ? (errorData['message'] as List).join(', ')
            : errorData['message'];
        debugPrint('⚠️ [AuthRepository] Falló registro: $msg');
        return {
          'success': false,
          'error': msg ?? 'Error al registrar usuario.',
        };
      }
    } catch (e) {
      debugPrint('❌ [AuthRepository] Excepción en register: $e');
      return {
        'success': false,
        'error': 'Error de conexión con el servidor: $e',
      };
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) =>
      registerWithEmail(
        email: email,
        password: password,
        displayName: name,
        phoneNumber: phone,
      );

  Future<Map<String, dynamic>> loginWithGoogle() async {
    debugPrint('🌐 [AuthRepository] Iniciando flujo nativo de Google Sign-In...');
    try {
      final clientId = AppConfig.googleServerClientId.trim();
      final googleSignIn = GoogleSignIn(
        serverClientId: clientId.isNotEmpty ? clientId : null,
        scopes: ['email', 'profile'],
      );

      final account = await googleSignIn.signIn();
      if (account == null) {
        debugPrint('ℹ️ [AuthRepository] Inicio de sesión con Google cancelado por el usuario');
        return {'success': false, 'error': 'Inicio de sesión con Google cancelado.'};
      }

      debugPrint('👤 [Google Account]: ${account.displayName} (${account.email})');
      final auth = await account.authentication;
      final idToken = auth.idToken;

      if (idToken == null || idToken.isEmpty) {
        debugPrint('⚠️ [AuthRepository] Google no retornó idToken. Verifique el Web Client ID en .env');
        return {
          'success': false,
          'error': 'No se pudo obtener el token de Google. Verifique la configuración de Google Cloud.',
        };
      }

      debugPrint('🔑 [Google ID Token obtenido]: ${idToken.substring(0, 25)}...');

      final response = await ApiClient.post('/auth/google/token', body: {
        'id_token': idToken,
        'app_source': 'CONSUMER_APP',
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        ApiClient.setTokens(
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
        );
        debugPrint('🎉 [AuthRepository] Autenticación Google exitosa en Backend Likora!');
        return {
          'success': true,
          'user': data['user'],
          'token': data['access_token'],
        };
      } else {
        final err = jsonDecode(response.body);
        final msg = err['message'] is List ? (err['message'] as List).join(', ') : err['message'];
        debugPrint('⚠️ [AuthRepository] Error Backend Google Auth: $msg');
        return {'success': false, 'error': msg ?? 'Error al autenticar con Google'};
      }
    } catch (e, stack) {
      debugPrint('❌ [AuthRepository] Excepción en Google Sign-In: $e');
      debugPrint('📍 $stack');
      return {'success': false, 'error': 'Excepción con Google: $e'};
    }
  }
}
