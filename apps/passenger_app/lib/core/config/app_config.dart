import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static Future<void> initialize() async {
    try {
      await dotenv.load(fileName: ".env");
    } catch (e) {
      // Fallback si no existe o falla la carga
    }
  }

  static String get apiBaseUrl {
    return dotenv.env['API_BASE_URL'] ?? 'http://192.168.1.68:3000/api/v1';
  }

  static String get socketUrl {
    return dotenv.env['SOCKET_SERVER_URL'] ?? 'http://192.168.1.68:3001';
  }

  static String get environment {
    return dotenv.env['ENVIRONMENT'] ?? 'development';
  }
}
