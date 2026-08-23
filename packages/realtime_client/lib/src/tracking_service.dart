import 'package:core_models/core_models.dart';
import 'socket_client.dart';

class TrackingService {
  final LikoraSocketClient socketClient;

  TrackingService({required this.socketClient});

  void sendDriverLocation({
    required String driverId,
    required LocationCoordinate coordinate,
  }) {
    socketClient.emit('driver_location_update', {
      'driverId': driverId,
      'latitude': coordinate.latitude,
      'longitude': coordinate.longitude,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  void subscribeToTripTracking(String tripId, Function(LocationCoordinate) onUpdate) {
    socketClient.messageStream.listen((event) {
      if (event['type'] == 'trip_location' && event['tripId'] == tripId) {
        onUpdate(LocationCoordinate.fromJson(event['location'] as Map<String, dynamic>));
      }
    });
  }
}
