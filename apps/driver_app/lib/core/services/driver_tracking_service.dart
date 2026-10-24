import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:core_models/core_models.dart';
import 'package:realtime_client/realtime_client.dart';
import '../config/driver_config.dart';

class TrackingLogEntry {
  final DateTime timestamp;
  final double latitude;
  final double longitude;
  final double speedKmh;
  final int statusCode;
  final String message;

  TrackingLogEntry({
    required this.timestamp,
    required this.latitude,
    required this.longitude,
    required this.speedKmh,
    required this.statusCode,
    required this.message,
  });
}

class DriverTrackingService extends ChangeNotifier {
  static final DriverTrackingService _instance = DriverTrackingService._internal();
  factory DriverTrackingService() => _instance;
  DriverTrackingService._internal() {
    _initSocket();
  }

  // Identificadores de conductor y entrega
  String driverId = 'drv-carlos-mendoza-01';
  String driverName = 'Carlos Mendoza';
  String orderId = 'ORD-8492';
  String vehiclePlate = 'LIK-204';
  String vehicleType = 'Motocicleta Honda CB160';

  // Coordenadas iniciales (Likora El Poblado - Medellín)
  static const double storeLat = 6.208571;
  static const double storeLng = -75.568434;

  // Destino del cliente (Carrera 43A #1-50, Medellín)
  static const double destLat = 6.234200;
  static const double destLng = -75.589500;

  // Estado del GPS y telemetría
  double latitude = storeLat;
  double longitude = storeLng;
  double heading = 85.0; // grados
  double speedKmh = 0.0;
  double accuracy = 3.2; // metros
  bool isOnline = true;
  String deliveryStatus = 'EN_CAMINO'; // DISPONIBLE, EN_CAMINO, LLEGANDO, ENTREGADO

  // Control de transmisión
  bool isTransmitting = false;
  int intervalSeconds = 3;
  Timer? _trackingTimer;
  int packetsSentCount = 0;
  DateTime? lastPingTime;
  String lastServerResponse = 'Inactivo';

  // Simulación de ruta
  double routeProgress = 0.15; // 0.0 a 1.0
  bool isAutoMoving = false;

  // Logs de telemetría recientes
  final List<TrackingLogEntry> logs = [];

  // Socket client opcional
  late LikoraSocketClient _socketClient;
  late TrackingService _socketTrackingService;

  void _initSocket() {
    _socketClient = LikoraSocketClient(serverUrl: DriverConfig.socketUrl);
    _socketTrackingService = TrackingService(socketClient: _socketClient);
    _socketClient.connect();
  }

  /// Inicia la transmisión continua del GPS
  void startTransmitting() {
    if (isTransmitting) return;
    isTransmitting = true;
    notifyListeners();

    // Enviar el primer ping de inmediato
    sendCurrentLocation();

    // Iniciar timer recurrente
    _trackingTimer?.cancel();
    _trackingTimer = Timer.periodic(Duration(seconds: intervalSeconds), (timer) {
      if (!isTransmitting) {
        timer.cancel();
        return;
      }

      if (isAutoMoving) {
        _advanceRouteSimulation();
      }

      sendCurrentLocation();
    });
  }

  /// Detiene la transmisión periódica
  void stopTransmitting() {
    isTransmitting = false;
    _trackingTimer?.cancel();
    _trackingTimer = null;
    notifyListeners();
  }

  /// Cambia el intervalo de actualización (ej. 2s, 3s, 5s)
  void setInterval(int seconds) {
    intervalSeconds = seconds;
    if (isTransmitting) {
      stopTransmitting();
      startTransmitting();
    } else {
      notifyListeners();
    }
  }

  /// Activa o pausa el desplazamiento automático simulado sobre la ruta
  void toggleAutoMovement() {
    isAutoMoving = !isAutoMoving;
    if (isAutoMoving && !isTransmitting) {
      startTransmitting();
    }
    notifyListeners();
  }

  /// Avanza la posición a lo largo de la ruta hacia el destino
  void _advanceRouteSimulation() {
    if (routeProgress < 0.98) {
      routeProgress += 0.025;
      speedKmh = 28.0 + (math.Random().nextDouble() * 12.0); // 28 a 40 km/h
    } else {
      routeProgress = 1.0;
      speedKmh = 0.0;
      deliveryStatus = 'LLEGANDO';
    }

    // Interpolación lineal con ligera curvatura urbana
    final lat = storeLat + (destLat - storeLat) * routeProgress;
    final lng = storeLng + (destLng - storeLng) * routeProgress;
    final curveOffset = math.sin(routeProgress * math.pi) * 0.0035;

    latitude = lat + curveOffset;
    longitude = lng;
    heading = 90.0 + (math.Random().nextDouble() * 15.0);
    accuracy = 2.5 + (math.Random().nextDouble() * 1.5);
  }

  /// Envía un ping de ubicación GPS al backend
  Future<bool> sendCurrentLocation() async {
    final now = DateTime.now();
    lastPingTime = now;

    // Emisión vía socket client de la arquitectura Likora
    try {
      _socketTrackingService.sendDriverLocation(
        driverId: driverId,
        coordinate: LocationCoordinate(
          latitude: latitude,
          longitude: longitude,
          address: 'En ruta hacia destino de pedido #$orderId',
        ),
      );
    } catch (_) {}

    // Emisión vía API REST HTTP
    final payload = {
      'driver_id': driverId,
      'driver_name': driverName,
      'order_id': orderId,
      'latitude': double.parse(latitude.toStringAsFixed(6)),
      'longitude': double.parse(longitude.toStringAsFixed(6)),
      'heading': double.parse(heading.toStringAsFixed(1)),
      'speed_kmh': double.parse(speedKmh.toStringAsFixed(1)),
      'accuracy': double.parse(accuracy.toStringAsFixed(1)),
      'is_online': isOnline,
      'status': deliveryStatus,
    };

    final url = '${DriverConfig.apiBaseUrl}/tracking/driver-location';

    try {
      final res = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 4));

      packetsSentCount++;
      lastServerResponse = '[${res.statusCode}] OK';

      _addLog(TrackingLogEntry(
        timestamp: now,
        latitude: latitude,
        longitude: longitude,
        speedKmh: speedKmh,
        statusCode: res.statusCode,
        message: 'GPS transmitido con éxito (HTTP ${res.statusCode})',
      ));

      notifyListeners();
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (e) {
      lastServerResponse = 'Error de red ($e)';
      _addLog(TrackingLogEntry(
        timestamp: now,
        latitude: latitude,
        longitude: longitude,
        speedKmh: speedKmh,
        statusCode: 0,
        message: 'Error enviando coordenadas: $e',
      ));
      notifyListeners();
      return false;
    }
  }

  void _addLog(TrackingLogEntry entry) {
    logs.insert(0, entry);
    if (logs.length > 20) {
      logs.removeLast();
    }
  }

  /// Actualiza manualmente las coordenadas
  void updateCoordinates(double newLat, double newLng, {double? newSpeed, double? newHeading}) {
    latitude = newLat;
    longitude = newLng;
    if (newSpeed != null) speedKmh = newSpeed;
    if (newHeading != null) heading = newHeading;
    notifyListeners();
    if (isTransmitting) {
      sendCurrentLocation();
    }
  }

  /// Cambia el estado de conexión (En línea / Desconectado)
  void setOnline(bool online) {
    isOnline = online;
    if (!online && isTransmitting) {
      stopTransmitting();
    }
    notifyListeners();
  }

  /// Actualiza el estado del pedido
  void setDeliveryStatus(String newStatus) {
    deliveryStatus = newStatus;
    notifyListeners();
    if (isTransmitting) {
      sendCurrentLocation();
    }
  }

  /// Reinicia la simulación de ruta al punto de partida
  void resetRoute() {
    routeProgress = 0.05;
    latitude = storeLat;
    longitude = storeLng;
    speedKmh = 0.0;
    deliveryStatus = 'EN_CAMINO';
    notifyListeners();
    if (isTransmitting) {
      sendCurrentLocation();
    }
  }

  @override
  void dispose() {
    _trackingTimer?.cancel();
    _socketClient.dispose();
    super.dispose();
  }
}
