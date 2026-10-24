class StoreModel {
  final String id;
  final String name;
  final String slug;
  final String code;
  final String description;
  final String address;
  final String city;
  final double latitude;
  final double longitude;
  final double coverageRadiusKm;
  final String openingTime;
  final String closingTime;
  final String posType;
  final bool isActive;
  final bool isMain;
  final double? distanceKm;
  final String? distanceFormatted;
  final bool isWithinCoverage;

  StoreModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.code,
    required this.description,
    required this.address,
    required this.city,
    required this.latitude,
    required this.longitude,
    required this.coverageRadiusKm,
    required this.openingTime,
    required this.closingTime,
    required this.posType,
    this.isActive = true,
    this.isMain = false,
    this.distanceKm,
    this.distanceFormatted,
    this.isWithinCoverage = true,
  });

  factory StoreModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic val, [double defaultValue = 0.0]) {
      if (val == null) return defaultValue;
      if (val is num) return val.toDouble();
      if (val is String) return double.tryParse(val) ?? defaultValue;
      return defaultValue;
    }

    return StoreModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Medellín',
      latitude: parseDouble(json['latitude']),
      longitude: parseDouble(json['longitude']),
      coverageRadiusKm: parseDouble(json['coverage_radius_km'], 5.0),
      openingTime: json['opening_time']?.toString() ?? '10:00',
      closingTime: json['closing_time']?.toString() ?? '02:00',
      posType: json['pos_type']?.toString() ?? 'physical_store',
      isActive: json['is_active'] != false,
      isMain: json['is_main'] == true,
      distanceKm: json['distance_km'] != null ? parseDouble(json['distance_km']) : null,
      distanceFormatted: json['distance_formatted']?.toString(),
      isWithinCoverage: json['is_within_coverage'] != false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'code': code,
      'description': description,
      'address': address,
      'city': city,
      'latitude': latitude,
      'longitude': longitude,
      'coverage_radius_km': coverageRadiusKm,
      'opening_time': openingTime,
      'closing_time': closingTime,
      'pos_type': posType,
      'is_active': isActive,
      'is_main': isMain,
      if (distanceKm != null) 'distance_km': distanceKm,
      if (distanceFormatted != null) 'distance_formatted': distanceFormatted,
      'is_within_coverage': isWithinCoverage,
    };
  }

  String get typeLabel {
    switch (posType) {
      case 'dark_store':
        return 'Hub Logístico 24/7';
      case 'express_kiosk':
        return 'Kiosco Express Mall';
      case 'physical_store':
      default:
        return 'Boutique & Cava';
    }
  }
}
