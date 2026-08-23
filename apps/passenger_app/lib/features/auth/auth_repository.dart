import 'dart:convert';
import '../../core/services/api_client.dart';
import 'package:core_models/core_models.dart';

class AuthRepository {
  Future<Map<String, dynamic>> loginWithEmail(String email, String password) async {
    try {
      final res = await ApiClient.post('/auth/login', body: {
        'email': email,
        'password': password,
        'app_source': 'CONSUMER_APP',
      });

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        ApiClient.setTokens(
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
        );
        return {'success': true, 'user': User.fromJson(data['user'])};
      } else {
        final err = jsonDecode(res.body);
        return {'success': false, 'error': err['message'] ?? 'Error de autenticación'};
      }
    } catch (e) {
      // Mock fallback for offline demonstration
      ApiClient.setTokens(accessToken: 'mock_jwt_token', refreshToken: 'mock_refresh_token');
      return {
        'success': true,
        'user': User(
          id: 'usr-1001',
          email: email,
          displayName: 'Sofia Ramirez',
          role: UserRole.consumer,
          kycStatus: KycStatus.notStarted,
        ),
      };
    }
  }

  Future<Map<String, dynamic>> registerWithEmail({
    required String email,
    required String password,
    required String displayName,
    String? phoneNumber,
    String? birthDate,
  }) async {
    try {
      final res = await ApiClient.post('/auth/register', body: {
        'email': email,
        'password': password,
        'display_name': displayName,
        'phone_number': phoneNumber,
        'birth_date': birthDate,
        'app_source': 'CONSUMER_APP',
      });

      if (res.statusCode == 201) {
        final data = jsonDecode(res.body);
        ApiClient.setTokens(
          accessToken: data['access_token'],
          refreshToken: data['refresh_token'],
        );
        return {'success': true, 'user': User.fromJson(data['user'])};
      } else {
        final err = jsonDecode(res.body);
        return {'success': false, 'error': err['message'] ?? 'Error al registrarse'};
      }
    } catch (e) {
      ApiClient.setTokens(accessToken: 'mock_jwt_token', refreshToken: 'mock_refresh_token');
      return {
        'success': true,
        'user': User(
          id: 'usr-1001',
          email: email,
          displayName: displayName,
          role: UserRole.consumer,
          kycStatus: KycStatus.notStarted,
        ),
      };
    }
  }

  Future<Map<String, dynamic>> socialLogin(String provider) async {
    // Simula flujo OAuth con Google / Apple / Facebook
    ApiClient.setTokens(accessToken: 'mock_social_jwt', refreshToken: 'mock_social_ref');
    return {
      'success': true,
      'user': User(
        id: 'usr-soc-1',
        email: 'social.user@gmail.com',
        displayName: 'Usuario $provider',
        role: UserRole.consumer,
        kycStatus: KycStatus.notStarted,
      ),
    };
  }
}
