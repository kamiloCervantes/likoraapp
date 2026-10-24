-- ============================================================================
-- SCRIPT DE SEED: 6 TIENDAS Y PRODUCTOS ASOCIADOS EN LIKORA
-- Base de datos: likora_db
-- ============================================================================

-- 1. Asegurar que las 38 categorías base del catálogo maestro sean GLOBALES (store_id = NULL)
UPDATE categories SET store_id = NULL WHERE store_id IS NOT NULL;

-- 2. Insertar o actualizar 6 Tiendas principales

INSERT INTO stores (
    id, name, slug, code, description, phone, email, address,
    city, state, country, latitude, longitude, coverage_radius_km,
    opening_time, closing_time, pos_type, is_active, is_main, created_at, updated_at
) VALUES (
    '3ea32522-c707-4f18-b875-f689c7c815f2', 'Likora Boutique & Lounge - El Poblado', 'likora-boutique-lounge-el-poblado', 'POS-MED-POB-01', 'Tienda flagship principal y showroom de destilados premium con cava climatizada.', '+57 (4) 444-5456', 'poblado@likora.app', 'Cra. 43A # 5A-113, El Poblado',
    'Medellín', 'Antioquia', 'Colombia', 6.208571, -75.568434, 6.0,
    '10:00', '02:00', 'physical_store', true, true, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    coverage_radius_km = EXCLUDED.coverage_radius_km,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    pos_type = EXCLUDED.pos_type,
    is_active = EXCLUDED.is_active,
    is_main = EXCLUDED.is_main,
    updated_at = NOW();


INSERT INTO stores (
    id, name, slug, code, description, phone, email, address,
    city, state, country, latitude, longitude, coverage_radius_km,
    opening_time, closing_time, pos_type, is_active, is_main, created_at, updated_at
) VALUES (
    '040435f8-e5de-47fd-83b6-4f7441386c18', 'Likora Express - Laureles', 'likora-express-laureles', 'POS-MED-LAU-02', 'Punto exprés en zona rosa Laureles con entregas rápidas de cervezas frías, rones y coctelería.', '+57 (4) 444-5457', 'laureles@likora.app', 'Circular 73B # 39B-12, Primer Parque de Laureles',
    'Medellín', 'Antioquia', 'Colombia', 6.244203, -75.592582, 4.5,
    '11:00', '03:00', 'physical_store', true, false, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    coverage_radius_km = EXCLUDED.coverage_radius_km,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    pos_type = EXCLUDED.pos_type,
    is_active = EXCLUDED.is_active,
    is_main = EXCLUDED.is_main,
    updated_at = NOW();


INSERT INTO stores (
    id, name, slug, code, description, phone, email, address,
    city, state, country, latitude, longitude, coverage_radius_km,
    opening_time, closing_time, pos_type, is_active, is_main, created_at, updated_at
) VALUES (
    '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'Likora Dark Store Hub - Envigado', 'likora-dark-store-hub-envigado', 'DS-MED-ENV-01', 'Centro logístico exclusivo para despachos ultrarrápidos al sur del Valle de Aburrá.', '+57 (4) 444-5458', 'envigado@likora.app', 'Calle 37 Sur # 43A-60, Centro de Envigado',
    'Envigado', 'Antioquia', 'Colombia', 6.171243, -75.586142, 8.0,
    '08:00', '04:00', 'dark_store', true, false, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    coverage_radius_km = EXCLUDED.coverage_radius_km,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    pos_type = EXCLUDED.pos_type,
    is_active = EXCLUDED.is_active,
    is_main = EXCLUDED.is_main,
    updated_at = NOW();


INSERT INTO stores (
    id, name, slug, code, description, phone, email, address,
    city, state, country, latitude, longitude, coverage_radius_km,
    opening_time, closing_time, pos_type, is_active, is_main, created_at, updated_at
) VALUES (
    '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'Likora Kiosk Express - Centro Comercial Santafé', 'likora-kiosk-express-santafe', 'POS-MED-SNT-03', 'Kiosco premium en mall comercial con estuches de regalo, champaña y cócteles listos para consumir.', '+57 (4) 444-5459', 'santafe@likora.app', 'Carrera 43A # 7 Sur-170, Nivel 1 Plaza Principal',
    'Medellín', 'Antioquia', 'Colombia', 6.197321, -75.574189, 3.0,
    '10:00', '21:00', 'express_kiosk', true, false, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    coverage_radius_km = EXCLUDED.coverage_radius_km,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    pos_type = EXCLUDED.pos_type,
    is_active = EXCLUDED.is_active,
    is_main = EXCLUDED.is_main,
    updated_at = NOW();


INSERT INTO stores (
    id, name, slug, code, description, phone, email, address,
    city, state, country, latitude, longitude, coverage_radius_km,
    opening_time, closing_time, pos_type, is_active, is_main, created_at, updated_at
) VALUES (
    '4334c2d6-b414-483b-824f-ceacfe602d91', 'Likora Cava & Gran Reserva - Llanogrande', 'likora-cava-gran-reserva-llanogrande', 'POS-ANT-LLA-01', 'Boutique campestre de alta gama en Oriente Antioqueño con cava subterránea de añadas históricas.', '+57 (4) 537-8899', 'llanogrande@likora.app', 'Km 8 Vía Don Diego - Llanogrande, Mall Complex Local 12',
    'Rionegro', 'Antioquia', 'Colombia', 6.13452, -75.42981, 12.0,
    '11:00', '23:00', 'physical_store', true, false, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    coverage_radius_km = EXCLUDED.coverage_radius_km,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    pos_type = EXCLUDED.pos_type,
    is_active = EXCLUDED.is_active,
    is_main = EXCLUDED.is_main,
    updated_at = NOW();


INSERT INTO stores (
    id, name, slug, code, description, phone, email, address,
    city, state, country, latitude, longitude, coverage_radius_km,
    opening_time, closing_time, pos_type, is_active, is_main, created_at, updated_at
) VALUES (
    '026ce57b-9786-405f-a9d0-d9bff97ff520', 'Likora 24/7 Delivery Hub - Belén / Guayabal', 'likora-24-7-delivery-hub-belen-guayabal', 'DS-MED-BEL-02', 'Hub logístico de alta rotación con atención y delivery ininterrumpido 24 horas al día, 7 días.', '+57 (4) 444-5460', 'guayabal@likora.app', 'Cra. 65 # 25-80, Sector Industrial Guayabal',
    'Medellín', 'Antioquia', 'Colombia', 6.22514, -75.58321, 7.5,
    '00:00', '23:59', 'dark_store', true, false, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    coverage_radius_km = EXCLUDED.coverage_radius_km,
    opening_time = EXCLUDED.opening_time,
    closing_time = EXCLUDED.closing_time,
    pos_type = EXCLUDED.pos_type,
    is_active = EXCLUDED.is_active,
    is_main = EXCLUDED.is_main,
    updated_at = NOW();

-- 3. Categorías exclusivas por tienda

INSERT INTO categories (
    id, store_id, name, slug, description, image_url, icon, parent_id, display_order, is_active, created_at, updated_at
) VALUES (
    '8a3e7b1a-9f2d-4e5c-a1b2-c3d4e5f6a7b8', '4334c2d6-b414-483b-824f-ceacfe602d91', 'Cava Privada & Añadas Históricas', 'cava-privada-anadas-historicas-llanogrande', 'Joyas enológicas de guarda, vinos franceses Premier Grand Cru y cosechas míticas reservadas.', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80', 'wine_bar', NULL, 20, true, NOW(), NOW()
) ON CONFLICT (slug) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    icon = EXCLUDED.icon,
    updated_at = NOW();


INSERT INTO categories (
    id, store_id, name, slug, description, image_url, icon, parent_id, display_order, is_active, created_at, updated_at
) VALUES (
    '7b2c9d1e-8f3a-4e6b-b2c3-d4e5f6a7b8c9', '026ce57b-9786-405f-a9d0-d9bff97ff520', 'Combos Rumberos 24/7 & Hielo', 'combos-rumberos-24-7-hielo-guayabal', 'Combos de rumba nocturna con aguardiente, ron, pasantes, hielo purificado y snacks.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80', 'sports_bar', NULL, 21, true, NOW(), NOW()
) ON CONFLICT (slug) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    icon = EXCLUDED.icon,
    updated_at = NOW();


INSERT INTO categories (
    id, store_id, name, slug, description, image_url, icon, parent_id, display_order, is_active, created_at, updated_at
) VALUES (
    '6c1d8e2f-7a4b-4f5c-c3d4-e5f6a7b8c9d0', '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'Estuches de Regalo & Experiencias', 'estuches-de-regalo-experiencias-santafe', 'Cajas de lujo con copas grabadas, miniaturas de colección y kits de coctelería para obsequio.', 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&q=80', 'card_giftcard', NULL, 22, true, NOW(), NOW()
) ON CONFLICT (slug) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    icon = EXCLUDED.icon,
    updated_at = NOW();

-- 4. Productos asociados a sus respectivas tiendas

INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000026', 'LAU-CER-001', 'Sixpack BBC Monserrate Roja Artesanal (330ml x 6)', 'sixpack-bbc-monserrate-roja-artesanal-laureles', 'Cerveza artesanal roja con notas acarameladas y balance suave de lúpulo. Servida fría desde la cava express de Laureles.',
    14.5, 17.0, 80, '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.85, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000025', 'LAU-CER-002', 'Pack Corona Extra Importada (355ml x 6) + Limones', 'pack-corona-extra-importada-laureles', 'Cerveza mexicana clara y refrescante, incluye rodajas frescas de lima listas para servir.',
    15.0, 18.0, 65, '[{"url": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.9, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000019', 'LAU-RON-001', 'Ron Medellín Extra Añejo 8 Años (750ml)', 'ron-medellin-extra-anejo-8-anos-laureles', 'Orgullo antioqueño añejado naturalmente en barricas de roble blanco americano sin azúcar añadido.',
    22.0, 25.0, 50, '[{"url": "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.88, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000028', 'LAU-AGU-001', 'Aguardiente Antioqueño Tapa Azul Sin Azúcar (750ml)', 'aguardiente-antioqueno-tapa-azul-750ml-laureles', 'El clásico licor anisado tradicional de Antioquia, formulado sin azúcar con graduación alcohólica equilibrada.',
    16.5, 19.0, 90, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.95, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000027', 'LAU-RTD-001', 'Four Loko Gold Energy Blend (473ml)', 'four-loko-gold-energy-blend-laureles', 'Bebida saborizada lista para tomar con notas cítricas e intensas de frutas tropicales.',
    6.5, 8.0, 40, '[{"url": "https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.5, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'LAU-WHI-001', 'Jack Daniel''s Old No. 7 Tennessee Whiskey (700ml)', 'jack-daniels-old-no-7-tennessee-laureles', 'Filtrado gota a gota a través de 3 metros de carbón de arce azucarero para suavidad inconfundible.',
    36.0, 42.0, 35, '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.87, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000012', 'LAU-VOD-001', 'Absolut Raspberri Vodka Saborizado (750ml)', 'absolut-raspberri-vodka-saborizado-laureles', 'Vodka sueco infusionado con frambuesas silvestres maduras. Ideal para cócteles refrescantes.',
    24.5, 28.0, 25, '[{"url": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80", "isCover": true}]'::jsonb, false, false, 4.75, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000013', 'LAU-VIN-001', 'Casillero del Diablo Cabernet Sauvignon (750ml)', 'casillero-del-diablo-cabernet-sauvignon-laureles', 'Tinto chileno del Valle Central con notas a ciruelas negras y toques de vainilla tostada.',
    15.5, 18.0, 40, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.7, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000030', 'LAU-DIG-001', 'Jägermeister Herbal Liqueur (700ml)', 'jagermeister-herbal-liqueur-laureles', 'Licor digestivo alemán elaborado con 56 hierbas, raíces y flores secretas. Servir a -18°C.',
    29.0, 33.0, 30, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.89, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '040435f8-e5de-47fd-83b6-4f7441386c18', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000025', 'LAU-CER-003', 'Pack Stella Artois Belgian Lager (330ml x 6)', 'pack-stella-artois-belgian-lager-laureles', 'Lager belga prémium con notas de lúpulo Saaz floral y un final crujiente y limpio.',
    16.0, 19.0, 45, '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.82, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'ENV-WHI-001', 'Buchanan''s Deluxe 12 Años Blended Scotch (1000ml / 1L)', 'buchanans-deluxe-12-anos-1-litro-envigado', 'Presentación de 1 Litro para celebraciones. Notas de cítricos dulces, chocolate y madera ahumada.',
    54.0, 62.0, 40, '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.93, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000025', 'ENV-CER-001', 'Caja Heineken Pure Malt Lager (24 Latas x 330ml)', 'caja-heineken-pure-malt-24-latas-envigado', 'Caja completa de 24 latas frías despachada desde el hub logístico de Envigado.',
    38.0, 45.0, 60, '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.9, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000011', 'ENV-VOD-001', 'Smirnoff No. 21 Red Label Vodka (1000ml / 1L)', 'smirnoff-no-21-red-label-1l-envigado', 'Triple destilación y diez filtraciones en carbón para máxima pureza en mezclas de coctelería.',
    19.5, 23.0, 70, '[{"url": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.7, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'ENV-TEQ-001', 'Tequila 1800 Cristalino Añejo (700ml)', 'tequila-1800-cristalino-anejo-envigado', 'Añejado en barricas de roble francés y americano con terminado en barricas de oporto. Cristalino y sedoso.',
    68.0, 76.0, 25, '[{"url": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.94, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000019', 'ENV-RON-001', 'Ron Zacapa Centenario 23 Sistema Solera (750ml)', 'ron-zacapa-centenario-23-envigado', 'Elaborado con miel virgen de caña de azúcar y añejado en las alturas de Guatemala entre 2.300 metros.',
    62.0, 70.0, 20, '[{"url": "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.96, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000025', 'ENV-CER-002', 'Sixpack Club Colombia Dorada Especial (330ml x 6)', 'sixpack-club-colombia-dorada-envigado', 'Cerveza premium colombiana elaborada con maltas seleccionadas y notas doradas brillantes.',
    11.5, 13.5, 90, '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.8, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000028', 'ENV-AGU-001', 'Garrafa Aguardiente Antioqueño Azul (1750ml / Media Galón)', 'garrafa-aguardiente-antioqueno-azul-1750ml-envigado', 'Formato rendidor garrafa de 1.75 litros para reuniones familiares y celebraciones.',
    34.0, 39.0, 40, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.91, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'ENV-WHI-002', 'Johnnie Walker Black Label 12 Años (1000ml)', 'johnnie-walker-black-label-1l-envigado', 'Botella de litro con mezcla icónica de más de 29 maltas escocesas maduradas por un mínimo de 12 años.',
    48.0, 55.0, 45, '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.9, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000027', 'ENV-RTD-001', 'Pack Smirnoff Ice Original (300ml x 6 Botellas)', 'pack-smirnoff-ice-original-envigado', 'Bebida cítrica premium ligeramente carbonatada lista para disfrutar bien helada.',
    16.5, 19.5, 55, '[{"url": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.78, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '7bc910e9-d5ec-4bd6-8626-30c37f8bbc7f', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000013', 'ENV-VIN-001', 'Navarro Correas Colección Privada Malbec (750ml)', 'navarro-correas-malbec-envigado', 'Vino tinto mendocino con intensos aromas a violetas, ciruelas y chocolate negro.',
    18.0, 21.0, 30, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, false, false, 4.82, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000016', 'SNT-CHA-001', 'Veuve Clicquot Brut Yellow Label Champagne (750ml)', 'veuve-clicquot-brut-yellow-label-santafe', 'Champagne francés emblemático con predominio de Pinot Noir, equilibrio entre fuerza aromática y frescura.',
    78.0, 89.0, 25, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.96, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000029', 'SNT-CRE-001', 'Baileys Deliciously Light Irish Cream (700ml)', 'baileys-deliciously-light-irish-cream-santafe', 'Crema irlandesa original con un 40% menos de calorías y azúcar, conservando todo el sabor cremoso y notas de vainilla.',
    26.0, 30.0, 30, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.88, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', '0e447ff5-b803-4935-971a-8043cae10c40', NULL, 'SNT-REG-001', 'Cofre Regalo Gin Hendrick''s + Vaso Highball Tallado', 'cofre-regalo-gin-hendricks-santafe', 'Edición especial para obsequio con botella de Hendrick''s 700ml y vaso de cristal botánico tallado.',
    56.0, 65.0, 18, '[{"url": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.97, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000015', 'SNT-ROS-001', 'Whispering Angel Rosé Côtes de Provence (750ml)', 'whispering-angel-rose-cotes-de-provence-santafe', 'El vino rosado más codiciado de Provenza Francia. Aromas florales con frutas rojas crujientes y final mineral.',
    38.0, 44.0, 22, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.92, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000027', 'SNT-RTD-001', 'Chandon Garden Spritz Listo Para Servir (750ml)', 'chandon-garden-spritz-santafe', 'Espumante natural combinado con licor artesanal de cáscaras de naranja maceradas y botánicos. Servir con hielo y romero.',
    28.5, 33.0, 28, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.89, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000010', 'SNT-WHI-001', 'Hibiki Japanese Harmony Whisky (700ml)', 'hibiki-japanese-harmony-santafe', 'Armonía seductora de whiskies japoneses de malta y grano presentados en su frasco de 24 facetas que representan las estaciones.',
    145.0, 160.0, 12, '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.98, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000011', 'SNT-VOD-001', 'Grey Goose French Vodka con Dos Copas Martini (750ml)', 'grey-goose-estuche-martini-santafe', 'Estuche para regalo con vodka francés de trigo de invierno y dos copas icónicas de cóctel Martini.',
    49.0, 57.0, 15, '[{"url": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.91, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000014', 'SNT-BLA-001', 'Cloudy Bay Sauvignon Blanc Nueva Zelanda (750ml)', 'cloudy-bay-sauvignon-blanc-santafe', 'Blanco insignia de Marlborough con notas vivas de pomelo, fruta de la pasión e hierba recién cortada.',
    46.0, 52.0, 20, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, false, false, 4.9, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'SNT-TEQ-001', 'Don Julio 70 Añejo Cristalino (750ml)', 'don-julio-70-cristalino-santafe', 'El primer tequila añejo cristalino del mundo, celebrando los 70 años de la destilería de Don Julio González.',
    75.0, 85.0, 22, '[{"url": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.95, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '3e97431a-5307-4e66-9a1b-64e397b8c5f8', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000030', 'SNT-APE-001', 'Kit Aperol Spritz (Aperol 700ml + Cinzano Prosecco 750ml)', 'kit-aperol-spritz-santafe', 'Combo perfecto para preparar el auténtico Aperol Spritz italiano con rodajas de naranja incluidas.',
    32.0, 38.0, 35, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.88, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000016', 'LLA-CHA-001', 'Dom Pérignon Vintage Champagne Brut (750ml)', 'dom-perignon-vintage-champagne-brut-llanogrande', 'La cumbre del champagne francés. Cosecha exclusiva madurada durante más de 8 años en las cavas históricas de Épernay.',
    285.0, 320.0, 15, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.99, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'LLA-WHI-001', 'The Macallan Sherry Oak 18 Años Single Malt (700ml)', 'the-macallan-sherry-oak-18-anos-llanogrande', 'Madurado exclusivamente en barricas de roble seleccionadas a mano sazonadas con jerez de Jerez, España.',
    395.0, 430.0, 8, '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true}]'::jsonb, true, false, 5.0, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'ce7da1ee-340f-483c-b910-e7647dfcc53b', NULL, 'LLA-RES-001', 'Château Margaux Premier Grand Cru Classé (750ml)', 'chateau-margaux-premier-grand-cru-llanogrande', 'Una de las 5 joyas del Olimpo vitivinícola de Burdeos. Elegancia aristocrática, taninos de seda y potencial de guarda centenario.',
    850.0, 950.0, 4, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, true, false, 5.0, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000023', 'LLA-COG-001', 'Rémy Martin XO Cognac Fine Champagne (700ml)', 'remy-martin-xo-cognac-llanogrande', 'Mezcla opulenta de hasta 400 aguardientes de uva Ugni Blanc provenientes de Grande y Petite Champagne.',
    220.0, 250.0, 10, '[{"url": "https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.95, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000013', 'LLA-VIN-001', 'Vega Sicilia Único Gran Reserva Ribera del Duero (750ml)', 'vega-sicilia-unico-gran-reserva-llanogrande', 'El vino más mítico de España. Criado durante casi una década entre barricas de madera noble y botella.',
    490.0, 540.0, 6, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.99, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'LLA-TEQ-001', 'Clase Azul Reposado Tequila Edición Artesanal (750ml)', 'clase-azul-reposado-artesanal-llanogrande', 'Licor ultra-premium en licorera de cerámica artesanal mexicana pintada a mano. 8 meses en roble americano.',
    185.0, 210.0, 12, '[{"url": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.97, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000019', 'LLA-RON-001', 'Diplomático Ambassador Selection Rum (750ml)', 'diplomatico-ambassador-selection-llanogrande', 'Envejecido durante un mínimo de 12 años en barricas de bourbon y terminado en barricas de Pedro Ximénez.',
    240.0, 270.0, 8, '[{"url": "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=600&q=80", "isCover": true}]'::jsonb, false, false, 4.94, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000014', 'LLA-BLA-001', 'Louis Latour Puligny-Montrachet Premier Cru Borgoña (750ml)', 'louis-latour-puligny-montrachet-llanogrande', 'Chardonnay borgoñón de máxima expresión. Complejidad mineral, notas mantecosas de avellana tostada y final aristocrático.',
    145.0, 165.0, 10, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.93, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'LLA-WHI-002', 'Glenfiddich 21 Años Gran Reserva Rum Cask Finish (700ml)', 'glenfiddich-21-gran-reserva-llanogrande', 'Single malt escocés culminado en barricas de ron caribeño para aportar notas de jengibre, higo y vainilla picante.',
    210.0, 240.0, 14, '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.96, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '4334c2d6-b414-483b-824f-ceacfe602d91', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000017', 'LLA-POR-001', 'Taylor''s 20 Años Tawny Port Oporto (750ml)', 'taylors-20-tawny-port-llanogrande', 'Vino fortificado de Oporto envejecido en pipas de roble sazonadas. Notas suntuosas de nueces y cáscara de naranja.',
    82.0, 95.0, 16, '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.9, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000028', 'GUA-AGU-001', 'Aguardiente Real 1930 Especial Reserva (750ml)', 'aguardiente-real-1930-guayabal', 'Edición de lujo añejada en barricas de roble durante 14 meses. Aroma a anís suave y maderas nobles.',
    28.0, 32.0, 50, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, true, false, 4.95, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', '20786fa6-a5cd-41fb-be1f-46c283d5bd67', NULL, 'GUA-COM-001', 'Combo Rumba 24/7 (Aguardiente Azul 750ml + Hielo 3kg + 2 Red Bull)', 'combo-rumba-24-7-aguardiente-hielo-redbull-guayabal', 'El combo definitivo para no parar la fiesta. Incluye botella fría, bolsa de hielo purificado y 2 latas energizantes.',
    24.99, 30.0, 100, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.98, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000019', 'GUA-RON-001', 'Ron Viejo de Caldas Juan de la Cruz 5 Años (750ml)', 'ron-viejo-de-caldas-5-anos-guayabal', 'Añejado en barricas de roble blanco a más de 2.200 metros sobre el nivel del mar.',
    18.0, 21.0, 70, '[{"url": "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.82, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000025', 'GUA-CER-001', 'Pack Cerveza Coronita Extra (210ml x 12 Botellas)', 'pack-cerveza-coronita-extra-12-guayabal', 'Presentación mini perfecta para enfriar al instante y consumir sin perder la temperatura fría ideal.',
    18.5, 22.0, 80, '[{"url": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.88, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', '20786fa6-a5cd-41fb-be1f-46c283d5bd67', NULL, 'GUA-HIE-001', 'Bolsa de Hielo Purificado en Cubos Cristalinos (5 Kg)', 'bolsa-de-hielo-purificado-5kg-guayabal', 'Hielo gourmet de alta densidad y fusión lenta, filtrado por ósmosis inversa. Entrega inmediata con aislamiento térmico.',
    3.5, 5.0, 200, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.9, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'GUA-WHI-001', 'Something Special Blended Scotch Whisky (750ml)', 'something-special-scotch-whisky-guayabal', 'Whisky escocés tradicional de botella diamantada con notas mielosas y especias dulces.',
    23.0, 27.0, 55, '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.79, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000012', 'GUA-VOD-001', 'Smirnoff X1 Spicy Tamarindo (700ml)', 'smirnoff-x1-spicy-tamarindo-guayabal', 'Vodka infusionado con pulpa de tamarindo agridulce y un toque de chile picante mexicano. Servir en shots helados.',
    17.5, 20.0, 45, '[{"url": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.86, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000025', 'GUA-CER-002', 'Sixpack Cerveza Águila Original Lata (330ml x 6)', 'sixpack-cerveza-aguila-original-lata-guayabal', 'La cerveza tradicional de Colombia, dorada, ligera y siempre refrescante.',
    8.5, 10.0, 120, '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true}]'::jsonb, false, false, 4.75, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000028', 'GUA-AGU-002', 'Media Aguardiente Antioqueño Azul (375ml)', 'media-aguardiente-antioqueno-azul-375ml-guayabal', 'Formato media botella individual o para compartir en pareja. Siempre lista y helada.',
    9.5, 11.5, 85, '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true}]'::jsonb, false, true, 4.9, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();


INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(), '026ce57b-9786-405f-a9d0-d9bff97ff520', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'GUA-TEQ-001', 'Jose Cuervo Especial Silver Tequila (700ml)', 'jose-cuervo-especial-silver-guayabal', 'Tequila mixto blanco ideal para preparar jarras de Margarita en fiestas y parrandas.',
    21.0, 25.0, 50, '[{"url": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&q=80", "isCover": true}]'::jsonb, true, true, 4.78, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    store_id = EXCLUDED.store_id,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    stock_quantity = EXCLUDED.stock_quantity,
    images = EXCLUDED.images,
    is_featured = EXCLUDED.is_featured,
    is_offer = EXCLUDED.is_offer,
    rating = EXCLUDED.rating,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
