class LocationCoordinate {
  final double latitude;
  final double longitude;
  final String? address;

  const LocationCoordinate({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  factory LocationCoordinate.fromJson(Map<String, dynamic> json) {
    return LocationCoordinate(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }
}
