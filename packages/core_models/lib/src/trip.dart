import 'location.dart';

enum TripStatus { requested, accepted, driverArrived, inProgress, completed, cancelled }

class Trip {
  final String id;
  final String passengerId;
  final String? driverId;
  final LocationCoordinate origin;
  final LocationCoordinate destination;
  final double price;
  final TripStatus status;
  final DateTime createdAt;

  const Trip({
    required this.id,
    required this.passengerId,
    this.driverId,
    required this.origin,
    required this.destination,
    required this.price,
    this.status = TripStatus.requested,
    required this.createdAt,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['id'] as String,
      passengerId: json['passengerId'] as String,
      driverId: json['driverId'] as String?,
      origin: LocationCoordinate.fromJson(json['origin'] as Map<String, dynamic>),
      destination: LocationCoordinate.fromJson(json['destination'] as Map<String, dynamic>),
      price: (json['price'] as num).toDouble(),
      status: TripStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => TripStatus.requested,
      ),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'passengerId': passengerId,
      'driverId': driverId,
      'origin': origin.toJson(),
      'destination': destination.toJson(),
      'price': price,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
