import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class DriverConfig {
  static Future<void> initialize() async {
    try {
      await dotenv.load(fileName: ".env");
    } catch (e) {
      // Fallback si no existe o falla la carga del archivo .env
    }
  }

  static String get defaultApiBaseUrl {
    if (dotenv.isInitialized && dotenv.env['API_BASE_URL'] != null && dotenv.env['API_BASE_URL']!.isNotEmpty) {
      return dotenv.env['API_BASE_URL']!;
    }
    if (kIsWeb) return 'http://localhost:3000/api/v1';
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:3000/api/v1';
      }
    } catch (_) {}
    return 'http://localhost:3000/api/v1';
  }

  // Host configurable desde la UI de diagnóstico para pruebas con dispositivos físicos en red LAN
  static String customApiBaseUrl = '';

  static String get apiBaseUrl => customApiBaseUrl.isNotEmpty ? customApiBaseUrl : defaultApiBaseUrl;

  static String get socketUrl {
    if (dotenv.isInitialized && dotenv.env['SOCKET_SERVER_URL'] != null && dotenv.env['SOCKET_SERVER_URL']!.isNotEmpty) {
      return dotenv.env['SOCKET_SERVER_URL']!;
    }
    return 'http://localhost:3001';
  }

  static String get environment {
    return dotenv.env['ENVIRONMENT'] ?? 'development';
  }
}