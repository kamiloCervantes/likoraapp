
INSERT INTO users (
    id, email, email_verified, password_hash, display_name, role, status, created_at, updated_at
) VALUES (
    '11111111-2222-3333-4444-555555555555',
    'admin@likora.app',
    true,
    '$2b$10$8WHLn0gGphiyGyf9Cir6UuMJNhJZP2NfE/84xMH5N2xWVVbgoawqC',
    'Administrador Principal Likora',
    'ADMIN',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'ADMIN',
    status = 'ACTIVE',
    updated_at = NOW();

UPDATE users SET 
    role = 'ADMIN',
    password_hash = '$2b$10$8WHLn0gGphiyGyf9Cir6UuMJNhJZP2NfE/84xMH5N2xWVVbgoawqC'
WHERE email = 'soporte@gatewayit.co';
