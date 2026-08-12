class AddressModel {
  final String id;
  final String title;
  final String fullAddress;
  final String city;
  final String details;
  final bool isDefault;

  AddressModel({
    required this.id,
    required this.title,
    required this.fullAddress,
    required this.city,
    this.details = '',
    this.isDefault = false,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      fullAddress: json['full_address'] ?? '',
      city: json['city'] ?? '',
      details: json['details'] ?? '',
      isDefault: json['is_default'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'full_address': fullAddress,
      'city': city,
      'details': details,
      'is_default': isDefault,
    };
  }

  AddressModel copyWith({
    String? id,
    String? title,
    String? fullAddress,
    String? city,
    String? details,
    bool? isDefault,
  }) {
    return AddressModel(
      id: id ?? this.id,
      title: title ?? this.title,
      fullAddress: fullAddress ?? this.fullAddress,
      city: city ?? this.city,
      details: details ?? this.details,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
