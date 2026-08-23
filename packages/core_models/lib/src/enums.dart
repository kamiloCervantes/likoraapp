enum UserRole {
  consumer,
  driver,
  admin,
  storeOperator,
  support,
}

enum UserStatus {
  active,
  suspended,
  blockedUnderage,
}

enum KycStatus {
  notStarted,
  pendingReview,
  verified,
  rejected,
  expired,
}

enum DocumentType {
  dni,
  passport,
  driversLicense,
  foreignId,
}
