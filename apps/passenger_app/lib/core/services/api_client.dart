import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class ApiClient {
  static String get baseUrl => AppConfig.apiBaseUrl;
  
  static String? _accessToken;
  static String? _refreshToken;

  static void setTokens({required String accessToken, required String refreshToken}) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    debugPrint('🔑 [ApiClient] Tokens actualizados. AccessToken: ${_accessToken?.substring(0, 15)}...');
  }

  static void clearTokens() {
    _accessToken = null;
    _refreshToken = null;
    debugPrint('🔒 [ApiClient] Tokens eliminados (Logout).');
  }

  static String? get accessToken => _accessToken;
  static bool get isAuthenticated => _accessToken != null;

  static Future<http.Response> get(String endpoint) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    debugPrint('🌐 [API GET REQUEST] --> $uri');

    try {
      final response = await http.get(uri, headers: _headers());
      debugPrint('📥 [API GET RESPONSE] <-- [${response.statusCode}] $uri');
      debugPrint('📦 [BODY]: ${response.body}');

      if (response.statusCode == 401 && _refreshToken != null) {
        debugPrint('🔄 [ApiClient] Token expirado (401). Intentando renovación con Refresh Token...');
        final refreshed = await _refreshAccessToken();
        if (refreshed) {
          return await http.get(uri, headers: _headers());
        }
      }
      return response;
    } catch (e, stack) {
      debugPrint('❌ [API GET ERROR] en $uri: $e');
      debugPrint('📍 $stack');
      rethrow;
    }
  }

  static Future<http.Response> post(String endpoint, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final payloadStr = body != null ? jsonEncode(body) : '';
    debugPrint('🌐 [API POST REQUEST] --> $uri');
    debugPrint('📤 [PAYLOAD]: $payloadStr');

    try {
      final response = await http.post(
        uri,
        headers: _headers(),
        body: payloadStr.isNotEmpty ? payloadStr : null,
      );
      debugPrint('📥 [API POST RESPONSE] <-- [${response.statusCode}] $uri');
      debugPrint('📦 [BODY]: ${response.body}');

      if (response.statusCode == 401 && _refreshToken != null) {
        debugPrint('🔄 [ApiClient] Token expirado (401). Intentando renovación...');
        final refreshed = await _refreshAccessToken();
        if (refreshed) {
          return await http.post(
            uri,
            headers: _headers(),
            body: payloadStr.isNotEmpty ? payloadStr : null,
          );
        }
      }
      return response;
    } catch (e, stack) {
      debugPrint('❌ [API POST ERROR] en $uri: $e');
      debugPrint('📍 $stack');
      rethrow;
    }
  }

  static Future<http.Response> patch(String endpoint, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final payloadStr = body != null ? jsonEncode(body) : '';
    debugPrint('🌐 [API PATCH REQUEST] --> $uri');
    debugPrint('📤 [PAYLOAD]: $payloadStr');

    try {
      final response = await http.patch(
        uri,
        headers: _headers(),
        body: payloadStr.isNotEmpty ? payloadStr : null,
      );
      debugPrint('📥 [API PATCH RESPONSE] <-- [${response.statusCode}] $uri');
      debugPrint('📦 [BODY]: ${response.body}');

      if (response.statusCode == 401 && _refreshToken != null) {
        debugPrint('🔄 [ApiClient] Token expirado (401). Intentando renovación...');
        final refreshed = await _refreshAccessToken();
        if (refreshed) {
          return await http.patch(
            uri,
            headers: _headers(),
            body: payloadStr.isNotEmpty ? payloadStr : null,
          );
        }
      }
      return response;
    } catch (e, stack) {
      debugPrint('❌ [API PATCH ERROR] en $uri: $e');
      debugPrint('📍 $stack');
      rethrow;
    }
  }

  static Map<String, String> _headers() {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  static Future<bool> _refreshAccessToken() async {
    try {
      final uri = Uri.parse('$baseUrl/auth/refresh');
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh_token': _refreshToken}),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        _accessToken = data['access_token'];
        _refreshToken = data['refresh_token'];
        debugPrint('✅ [ApiClient] Token renovado exitosamente');
        return true;
      } else {
        clearTokens();
        debugPrint('❌ [ApiClient] Falló renovación de token');
        return false;
      }
    } catch (e) {
      clearTokens();
      debugPrint('❌ [ApiClient] Excepción al refrescar token: $e');
      return false;
    }
  }
}
