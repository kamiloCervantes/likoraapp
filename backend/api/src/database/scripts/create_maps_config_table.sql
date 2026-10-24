
CREATE TABLE IF NOT EXISTS maps_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_web TEXT,
    api_key_android TEXT,
    api_key_ios TEXT,
    api_key_server TEXT,
    is_live_tracking_enabled BOOLEAN NOT NULL DEFAULT true,
    is_directions_enabled BOOLEAN NOT NULL DEFAULT true,
    gps_update_interval_sec INTEGER NOT NULL DEFAULT 5,
    default_center_lat NUMERIC(10, 7) NOT NULL DEFAULT 6.2442030,
    default_center_lng NUMERIC(10, 7) NOT NULL DEFAULT -75.5925820,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert initial default configuration if empty
INSERT INTO maps_configs (
    id, api_key_web, api_key_android, api_key_ios, api_key_server,
    is_live_tracking_enabled, is_directions_enabled, gps_update_interval_sec,
    default_center_lat, default_center_lng, is_active
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'AIzaSyB_LikoraWebMapsKeyDemo2026_LiveKey',
    'AIzaSyB_LikoraAndroidKeyDemo2026_LiveKey',
    'AIzaSyB_LikoraIosKeyDemo2026_LiveKey',
    'AIzaSyB_LikoraServerKeyDemo2026_LiveKey',
    true,
    true,
    5,
    6.2085710,
    -75.5684340,
    true
) ON CONFLICT (id) DO NOTHING;
