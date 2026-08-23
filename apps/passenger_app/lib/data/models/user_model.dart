enum UserRole { client, storeAdmin }

class UserModel {
  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final String? documentId;
  final String? dateOfBirth;
  final String preferredStore;
  final UserRole role;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.documentId,
    this.dateOfBirth,
    this.preferredStore = 'Likora Central - Av. Principal 123',
    this.role = UserRole.client,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      avatarUrl: json['avatar_url'],
      documentId: json['document_id'],
      dateOfBirth: json['date_of_birth'],
      preferredStore: json['preferred_store'] ?? 'Likora Central - Av. Principal 123',
      role: json['role'] == 'admin' ? UserRole.storeAdmin : UserRole.client,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatar_url': avatarUrl,
      'document_id': documentId,
      'date_of_birth': dateOfBirth,
      'preferred_store': preferredStore,
      'role': role == UserRole.storeAdmin ? 'admin' : 'client',
    };
  }

  UserModel copyWith({
    String? name,
    String? email,
    String? avatarUrl,
    String? documentId,
    String? dateOfBirth,
    String? preferredStore,
    UserRole? role,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      documentId: documentId ?? this.documentId,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      preferredStore: preferredStore ?? this.preferredStore,
      role: role ?? this.role,
    );
  }
}
