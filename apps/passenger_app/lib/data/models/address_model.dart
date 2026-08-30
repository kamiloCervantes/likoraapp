class AddressModel {
  final String id;
  final String title;
  final String fullAddress;
  final String city;
  final String details;
  final double? latitude;
  final double? longitude;
  final bool isDefault;

  AddressModel({
    required this.id,
    required this.title,
    required this.fullAddress,
    required this.city,
    this.details = '',
    this.latitude,
    this.longitude,
    this.isDefault = false,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'] ?? '',
      title: json['alias'] ?? json['title'] ?? '',
      fullAddress: json['street_address'] ?? json['full_address'] ?? '',
      city: json['city'] ?? '',
      details: json['reference'] ?? json['details'] ?? '',
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      isDefault: json['is_active'] ?? json['is_default'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'alias': title,
      'title': title,
      'street_address': fullAddress,
      'full_address': fullAddress,
      'city': city,
      'reference': details,
      'details': details,
      'latitude': latitude,
      'longitude': longitude,
      'is_active': isDefault,
      'is_default': isDefault,
    };
  }

  AddressModel copyWith({
    String? id,
    String? title,
    String? fullAddress,
    String? city,
    String? details,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) {
    return AddressModel(
      id: id ?? this.id,
      title: title ?? this.title,
      fullAddress: fullAddress ?? this.fullAddress,
      city: city ?? this.city,
      details: details ?? this.details,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
