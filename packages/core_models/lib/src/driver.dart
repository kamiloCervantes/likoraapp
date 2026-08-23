import 'location.dart';

enum DriverStatus { offline, online, busy }

class Driver {
  final String id;
  final String fullName;
  final String phone;
  final String vehicleModel;
  final String licensePlate;
  final double rating;
  final DriverStatus status;
  final LocationCoordinate? currentLocation;

  const Driver({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.vehicleModel,
    required this.licensePlate,
    this.rating = 5.0,
    this.status = DriverStatus.offline,
    this.currentLocation,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      phone: json['phone'] as String,
      vehicleModel: json['vehicleModel'] as String,
      licensePlate: json['licensePlate'] as String,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      status: DriverStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => DriverStatus.offline,
      ),
      currentLocation: json['currentLocation'] != null
          ? LocationCoordinate.fromJson(json['currentLocation'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'phone': phone,
      'vehicleModel': vehicleModel,
      'licensePlate': licensePlate,
      'rating': rating,
      'status': status.name,
      'currentLocation': currentLocation?.toJson(),
    };
  }
}
