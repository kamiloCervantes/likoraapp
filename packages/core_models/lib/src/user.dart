import 'enums.dart';

class User {
  final String id;
  final String? email;
  final bool emailVerified;
  final String? phoneNumber;
  final bool phoneVerified;
  final String displayName;
  final DateTime? birthDate;
  final UserRole role;
  final UserStatus status;
  final KycStatus kycStatus;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const User({
    required this.id,
    this.email,
    this.emailVerified = false,
    this.phoneNumber,
    this.phoneVerified = false,
    required this.displayName,
    this.birthDate,
    this.role = UserRole.consumer,
    this.status = UserStatus.active,
    this.kycStatus = KycStatus.notStarted,
    this.createdAt,
    this.updatedAt,
  });

  bool get isKycVerified => kycStatus == KycStatus.verified;

  bool get isAdult {
    if (birthDate == null) return false;
    final today = DateTime.now();
    int age = today.year - birthDate!.year;
    if (today.month < birthDate!.month ||
        (today.month == birthDate!.month && today.day < birthDate!.day)) {
      age--;
    }
    return age >= 18;
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String?,
      emailVerified: (json['email_verified'] as bool?) ?? false,
      phoneNumber: json['phone_number'] as String?,
      phoneVerified: (json['phone_verified'] as bool?) ?? false,
      displayName: json['display_name'] as String,
      birthDate: json['birth_date'] != null
          ? DateTime.tryParse(json['birth_date'] as String)
          : null,
      role: UserRole.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['role'] as String? ?? 'CONSUMER'),
        orElse: () => UserRole.consumer,
      ),
      status: UserStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['status'] as String? ?? 'ACTIVE'),
        orElse: () => UserStatus.active,
      ),
      kycStatus: KycStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['kyc_status'] as String? ?? 'NOT_STARTED'),
        orElse: () => KycStatus.notStarted,
      ),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'email_verified': emailVerified,
      'phone_number': phoneNumber,
      'phone_verified': phoneVerified,
      'display_name': displayName,
      'birth_date': birthDate?.toIso8601String().split('T').first,
      'role': role.name.toUpperCase(),
      'status': status.name.toUpperCase(),
      'kyc_status': kycStatus.name.toUpperCase(),
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}
