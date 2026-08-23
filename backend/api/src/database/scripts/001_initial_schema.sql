-- =========================================================================
-- Likora Platform: Migración Inicial de Base de Datos (PostgreSQL + PostGIS)
-- Fase 1: Usuarios, Autenticación Federada y Verificación KYC de Edad
-- =========================================================================

-- 1. Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Creación de Tipos ENUM
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('CONSUMER', 'DRIVER', 'ADMIN', 'STORE_OPERATOR', 'SUPPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'BLOCKED_UNDERAGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status_enum AS ENUM ('NOT_STARTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth_provider_enum AS ENUM ('google', 'apple', 'facebook', 'microsoft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type_enum AS ENUM ('DNI', 'PASSPORT', 'DRIVERS_LICENSE', 'FOREIGN_ID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE app_source_enum AS ENUM ('CONSUMER_APP', 'DRIVER_APP', 'ADMIN_WEB');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_number VARCHAR(30) UNIQUE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash VARCHAR(255),
    display_name VARCHAR(150) NOT NULL,
    birth_date DATE,
    role user_role_enum NOT NULL DEFAULT 'CONSUMER',
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',
    kyc_status kyc_status_enum NOT NULL DEFAULT 'NOT_STARTED',
    last_known_location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_spatial_location ON users USING GIST (last_known_location);

-- 4. Tabla: federated_identities
CREATE TABLE IF NOT EXISTS federated_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider auth_provider_enum NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email_at_provider VARCHAR(255),
    raw_profile_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_provider_user_id UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_federated_user_id ON federated_identities(user_id);

-- 5. Tabla: identity_verifications
CREATE TABLE IF NOT EXISTS identity_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type document_type_enum NOT NULL,
    document_number_hash VARCHAR(64) NOT NULL,
    document_number_enc TEXT,
    extracted_birth_date DATE NOT NULL,
    front_image_path TEXT NOT NULL,
    back_image_path TEXT,
    selfie_image_path TEXT NOT NULL,
    status kyc_status_enum NOT NULL DEFAULT 'PENDING_REVIEW',
    rejection_reason TEXT,
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_doc_hash ON identity_verifications(document_number_hash);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON identity_verifications(status);

-- 6. Tabla: user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    app_source app_source_enum NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON user_sessions(refresh_token_hash);
