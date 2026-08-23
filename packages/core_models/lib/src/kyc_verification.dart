import 'enums.dart';

class IdentityVerification {
  final String id;
  final String userId;
  final DocumentType documentType;
  final String documentNumberHash;
  final DateTime extractedBirthDate;
  final String frontImagePath;
  final String? backImagePath;
  final String selfieImagePath;
  final KycStatus status;
  final String? rejectionReason;
  final DateTime? verifiedAt;
  final DateTime? expiresAt;
  final DateTime? createdAt;

  const IdentityVerification({
    required this.id,
    required this.userId,
    required this.documentType,
    required this.documentNumberHash,
    required this.extractedBirthDate,
    required this.frontImagePath,
    this.backImagePath,
    required this.selfieImagePath,
    this.status = KycStatus.pendingReview,
    this.rejectionReason,
    this.verifiedAt,
    this.expiresAt,
    this.createdAt,
  });

  factory IdentityVerification.fromJson(Map<String, dynamic> json) {
    return IdentityVerification(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      documentType: DocumentType.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['document_type'] as String),
        orElse: () => DocumentType.dni,
      ),
      documentNumberHash: json['document_number_hash'] as String,
      extractedBirthDate: DateTime.parse(json['extracted_birth_date'] as String),
      frontImagePath: json['front_image_path'] as String,
      backImagePath: json['back_image_path'] as String?,
      selfieImagePath: json['selfie_image_path'] as String,
      status: KycStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['status'] as String),
        orElse: () => KycStatus.pendingReview,
      ),
      rejectionReason: json['rejection_reason'] as String?,
      verifiedAt: json['verified_at'] != null
          ? DateTime.tryParse(json['verified_at'] as String)
          : null,
      expiresAt: json['expires_at'] != null
          ? DateTime.tryParse(json['expires_at'] as String)
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'document_type': documentType.name.toUpperCase(),
      'document_number_hash': documentNumberHash,
      'extracted_birth_date': extractedBirthDate.toIso8601String().split('T').first,
      'front_image_path': frontImagePath,
      'back_image_path': backImagePath,
      'selfie_image_path': selfieImagePath,
      'status': status.name.toUpperCase(),
      'rejection_reason': rejectionReason,
      'verified_at': verifiedAt?.toIso8601String(),
      'expires_at': expiresAt?.toIso8601String(),
      'created_at': createdAt?.toIso8601String(),
    };
  }
}
