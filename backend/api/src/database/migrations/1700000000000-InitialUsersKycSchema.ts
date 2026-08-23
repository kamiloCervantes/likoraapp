import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUsersKycSchema1700000000000 implements MigrationInterface {
  name = 'InitialUsersKycSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis";`);

    // 2. ENUMs
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM ('CONSUMER', 'DRIVER', 'ADMIN', 'STORE_OPERATOR', 'SUPPORT');`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_status_enum" AS ENUM ('ACTIVE', 'SUSPENDED', 'BLOCKED_UNDERAGE');`,
    );
    await queryRunner.query(
      `CREATE TYPE "kyc_status_enum" AS ENUM ('NOT_STARTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');`,
    );
    await queryRunner.query(
      `CREATE TYPE "auth_provider_enum" AS ENUM ('google', 'apple', 'facebook', 'microsoft');`,
    );
    await queryRunner.query(
      `CREATE TYPE "document_type_enum" AS ENUM ('DNI', 'PASSPORT', 'DRIVERS_LICENSE', 'FOREIGN_ID');`,
    );
    await queryRunner.query(
      `CREATE TYPE "app_source_enum" AS ENUM ('CONSUMER_APP', 'DRIVER_APP', 'ADMIN_WEB');`,
    );

    // 3. Table users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) UNIQUE,
        "email_verified" boolean NOT NULL DEFAULT false,
        "phone_number" varchar(30) UNIQUE,
        "phone_verified" boolean NOT NULL DEFAULT false,
        "password_hash" varchar(255),
        "display_name" varchar(150) NOT NULL,
        "birth_date" date,
        "role" "user_role_enum" NOT NULL DEFAULT 'CONSUMER',
        "status" "user_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "kyc_status" "kyc_status_enum" NOT NULL DEFAULT 'NOT_STARTED',
        "last_known_location" geometry(Point, 4326),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_users_spatial_location" ON "users" USING GIST ("last_known_location");`,
    );

    // 4. Table federated_identities
    await queryRunner.query(`
      CREATE TABLE "federated_identities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "provider" "auth_provider_enum" NOT NULL,
        "provider_user_id" varchar(255) NOT NULL,
        "email_at_provider" varchar(255),
        "raw_profile_data" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_provider_user_id" UNIQUE ("provider", "provider_user_id")
      );
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_federated_user_id" ON "federated_identities"("user_id");`,
    );

    // 5. Table identity_verifications
    await queryRunner.query(`
      CREATE TABLE "identity_verifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "document_type" "document_type_enum" NOT NULL,
        "document_number_hash" varchar(64) NOT NULL,
        "document_number_enc" text,
        "extracted_birth_date" date NOT NULL,
        "front_image_path" text NOT NULL,
        "back_image_path" text,
        "selfie_image_path" text NOT NULL,
        "status" "kyc_status_enum" NOT NULL DEFAULT 'PENDING_REVIEW',
        "rejection_reason" text,
        "reviewed_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "verified_at" timestamptz,
        "expires_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_kyc_user_id" ON "identity_verifications"("user_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_kyc_doc_hash" ON "identity_verifications"("document_number_hash");`,
    );

    // 6. Table user_sessions
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "refresh_token_hash" varchar(255) NOT NULL UNIQUE,
        "app_source" "app_source_enum" NOT NULL,
        "ip_address" varchar(45) NOT NULL,
        "user_agent" text NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "expires_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_sessions_user_id" ON "user_sessions"("user_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "identity_verifications";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "federated_identities";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "app_source_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "document_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_provider_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "kyc_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum";`);
  }
}
