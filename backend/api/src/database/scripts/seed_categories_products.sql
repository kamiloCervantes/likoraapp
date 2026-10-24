-- =============================================================================
-- LIKORA PLATFORM: SEED DE CATEGORÍAS, SUBCATEGORÍAS Y PRODUCTOS
-- =============================================================================
-- Arquitectura de Catálogo:
-- 1. Categorías Principales (parent_id IS NULL) -> Carrusel / Barra Superior en la App
-- 2. Subcategorías (parent_id = ID de la categoría principal) -> Pestañas / Filter Chips
-- 3. Productos asociados a su categoría principal (category_id) y subcategoría (subcategory_id)
-- =============================================================================

BEGIN;

-- 1. Asegurar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Asegurar columnas de jerarquía y metadata requeridas en la base de datos
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.8;

-- =============================================================================
-- PASO 1: CATEGORÍAS PRINCIPALES (8 NIVELES SUPERIORES)
-- =============================================================================

INSERT INTO categories (id, name, slug, description, image_url, icon, display_order, is_active, parent_id)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Tequila y Mezcal',
    'tequila-y-mezcal',
    'Tequilas 100% de agave azul y mezcales artesanales mexicanos.',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
    'local_bar',
    1,
    true,
    NULL
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Whisky / Whiskey',
    'whisky-whiskey',
    'Bourbon, Rye, Scotch Whisky, Irish y destilados del mundo.',
    'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80',
    'liquor',
    2,
    true,
    NULL
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Vodka',
    'vodka',
    'Vodkas clásicos puros de grano y selecciones saborizadas botánicas.',
    'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80',
    'local_bar',
    3,
    true,
    NULL
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Vinos',
    'vinos',
    'Tintos, blancos, rosados, espumosos y de postre de las mejores regiones.',
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80',
    'wine_bar',
    4,
    true,
    NULL
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'Ron (Rum)',
    'ron',
    'Rones caribeños y latinoamericanos: carta blanca, añejos de solera y especiados.',
    'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80',
    'liquor',
    5,
    true,
    NULL
  ),
  (
    'a0000000-0000-0000-0000-000000000006',
    'Brandy & Coñac (Cognac)',
    'brandy-cognac',
    'Cognacs franceses de denominación de origen y brandies tradicionales.',
    'https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=600&q=80',
    'wine_bar',
    6,
    true,
    NULL
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    'Cervezas y RTD (Ready to Drink)',
    'cervezas-y-rtd',
    'Cervezas nacionales, importadas, artesanales y cócteles preparados en lata.',
    'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80',
    'sports_bar',
    7,
    true,
    NULL
  ),
  (
    'a0000000-0000-0000-0000-000000000008',
    'Licores, Cremas y Tradicionales',
    'licores-cremas-y-tradicionales',
    'Aguardientes anisados, cremas de licor irlandesas y digestivos herbales.',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
    'liquor',
    8,
    true,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  parent_id = EXCLUDED.parent_id,
  updated_at = now();


-- =============================================================================
-- PASO 2: SUBCATEGORÍAS (HIJOS CON parent_id ASIGNADO)
-- =============================================================================

INSERT INTO categories (id, name, slug, description, image_url, icon, display_order, is_active, parent_id)
VALUES
  -- 1. Tequila y Mezcal
  ('b0000000-0000-0000-0000-000000000001', 'Tequila Blanco / Silver', 'tequila-blanco-silver', 'Sin añejar, ideal para coctelería y margaritas.', NULL, 'local_bar', 1, true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Tequila Reposado', 'tequila-reposado', '2 a 12 meses de maduración en barrica.', NULL, 'local_bar', 2, true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'Tequila Añejo', 'tequila-anejo', '1 a 3 años de maduración.', NULL, 'local_bar', 3, true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'Tequila Extra Añejo y Cristalino', 'tequila-extra-anejo-cristalino', 'Segmento Ultra-Premium.', NULL, 'local_bar', 4, true, 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000005', 'Mezcal', 'mezcal', 'Espadín, Tobalá, Ensambles artesanales con notas ahumadas.', NULL, 'local_bar', 5, true, 'a0000000-0000-0000-0000-000000000001'),

  -- 2. Whisky / Whiskey
  ('b0000000-0000-0000-0000-000000000006', 'Bourbon & Tennessee', 'bourbon-tennessee', 'Maíz y roble americano: Jack Daniels, Makers Mark.', NULL, 'liquor', 1, true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000007', 'Rye Whiskey', 'rye-whiskey', 'Whiskey de centeno con toque especiado.', NULL, 'liquor', 2, true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000008', 'Scotch Whisky (Escocés)', 'scotch-whisky-escoces', 'Single Malt y Blended: Johnnie Walker, Buchanans.', NULL, 'liquor', 3, true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000009', 'Irish & Canadian', 'irish-canadian', 'Jameson, Crown Royal y blends suaves.', NULL, 'liquor', 4, true, 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000010', 'Japanese & World Whiskeys', 'japanese-world-whiskeys', 'Whiskies de precisión japonesa e internacionales.', NULL, 'liquor', 5, true, 'a0000000-0000-0000-0000-000000000002'),

  -- 3. Vodka
  ('b0000000-0000-0000-0000-000000000011', 'Vodka Clásico (Original)', 'vodka-clasico-original', 'Titos, Grey Goose, Absolut.', NULL, 'local_bar', 1, true, 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000012', 'Vodka Saborizado', 'vodka-saborizado', 'Cítricos, frutos rojos, pepino y botánicos.', NULL, 'local_bar', 2, true, 'a0000000-0000-0000-0000-000000000003'),

  -- 4. Vinos
  ('b0000000-0000-0000-0000-000000000013', 'Vinos Tintos', 'vinos-tintos', 'Cabernet Sauvignon, Malbec, Pinot Noir, Merlot, Blends.', NULL, 'wine_bar', 1, true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000014', 'Vinos Blancos', 'vinos-blancos', 'Sauvignon Blanc, Chardonnay, Pinot Grigio.', NULL, 'wine_bar', 2, true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000015', 'Vinos Rosados', 'vinos-rosados', 'Rosé refrescante de estilo provenzal.', NULL, 'wine_bar', 3, true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000016', 'Espumosos y Champagne', 'espumosos-champagne', 'Prosecco, Cava, Champagne Brut.', NULL, 'wine_bar', 4, true, 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000017', 'Vinos Fortificados y Dulces', 'vinos-fortificados-dulces', 'Moscato, Oporto y vinos de postre.', NULL, 'wine_bar', 5, true, 'a0000000-0000-0000-0000-000000000004'),

  -- 5. Ron (Rum)
  ('b0000000-0000-0000-0000-000000000018', 'Ron Blanco / Carta Blanca', 'ron-blanco-carta-blanca', 'Ideal para coctelería y mezclas.', NULL, 'liquor', 1, true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000019', 'Ron Añejo / Dorado / Oscuro', 'ron-anejo-dorado-oscuro', 'Añejado en barrica: Medellín, Zacapa, Flor de Caña.', NULL, 'liquor', 2, true, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000020', 'Ron Especiado (Spiced)', 'ron-especiado-spiced', 'Captain Morgan y perfiles aromáticos de especias.', NULL, 'liquor', 3, true, 'a0000000-0000-0000-0000-000000000005'),

  -- 6. Brandy & Coñac (Cognac)
  ('b0000000-0000-0000-0000-000000000021', 'Cognac VS (Very Special)', 'cognac-vs', 'Ej. Hennessy VS.', NULL, 'wine_bar', 1, true, 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000022', 'Cognac VSOP (Very Superior Old Pale)', 'cognac-vsop', 'Ej. Hennessy VSOP, Rémy Martin VSOP.', NULL, 'wine_bar', 2, true, 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000023', 'Cognac XO (Extra Old)', 'cognac-xo', 'Segmento de alta gama con más de 10 años de añejamiento.', NULL, 'wine_bar', 3, true, 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000024', 'Brandy', 'brandy', 'Brandy español (Torres) y de solera tradicional.', NULL, 'wine_bar', 4, true, 'a0000000-0000-0000-0000-000000000006'),

  -- 7. Cervezas y RTD (Ready to Drink)
  ('b0000000-0000-0000-0000-000000000025', 'Cervezas Importadas & Nacionales', 'cervezas-importadas-nacionales', 'Corona, Heineken, Pilsener, Modelo.', NULL, 'sports_bar', 1, true, 'a0000000-0000-0000-0000-000000000007'),
  ('b0000000-0000-0000-0000-000000000026', 'Cervezas Artesanales (Craft Beer)', 'cervezas-artesanales', 'IPAs, Stouts, Ales de microcervecerías.', NULL, 'sports_bar', 2, true, 'a0000000-0000-0000-0000-000000000007'),
  ('b0000000-0000-0000-0000-000000000027', 'Cócteles Preparados en Lata / Hard Seltzers', 'cocteles-preparados-en-lata-hard-seltzers', 'High Noon, Nutrl, Margaritas y Palomas en lata.', NULL, 'sports_bar', 3, true, 'a0000000-0000-0000-0000-000000000007'),

  -- 8. Licores, Cremas y Tradicionales
  ('b0000000-0000-0000-0000-000000000028', 'Aguardientes y Anisados', 'aguardientes-y-anisados', 'Aguardiente Antioqueño, Cristal y anisados tradicionales.', NULL, 'liquor', 1, true, 'a0000000-0000-0000-0000-000000000008'),
  ('b0000000-0000-0000-0000-000000000029', 'Cremas de Whisky y Licores Dulces', 'cremas-de-whisky-y-licores-dulces', 'Baileys, Kahlúa y cremas dulces.', NULL, 'liquor', 2, true, 'a0000000-0000-0000-0000-000000000008'),
  ('b0000000-0000-0000-0000-000000000030', 'Digestivos y Herbales', 'digestivos-y-herbales', 'Jägermeister, Aperol y licores amargos botánicos.', NULL, 'liquor', 3, true, 'a0000000-0000-0000-0000-000000000008')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  parent_id = EXCLUDED.parent_id,
  updated_at = now();


-- =============================================================================
-- PASO 3: PRODUCTOS ICÓNICOS PARA CADA SUBCATEGORÍA
-- =============================================================================

INSERT INTO products (
  id,
  category_id,
  subcategory_id,
  sku,
  name,
  slug,
  description,
  price,
  compare_at_price,
  stock_quantity,
  images,
  is_active,
  is_featured,
  is_offer,
  rating
)
VALUES
  -- 1. TEQUILA Y MEZCAL
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'TEQ-BLA-001',
    'Don Julio Blanco Tequila (750ml)',
    'don-julio-blanco-tequila-750ml',
    'Tequila blanco 100% de agave azul. Fresco con aromas cítricos de limón y lima, toque ligeramente dulce y final limpio. Ideal para Margaritas de alta gama.',
    52.00,
    58.00,
    45,
    '[{"url": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&q=80", "isCover": true, "alt": "Don Julio Blanco Tequila"}]'::jsonb,
    true,
    true,
    false,
    4.9
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'TEQ-REP-001',
    'Casamigos Reposado Tequila (750ml)',
    'casamigos-reposado-tequila-750ml',
    'Envejecido durante 7 meses en barricas de roble blanco americano. Notas suaves de caramelo, cacao y roble tostado con final sedoso.',
    64.00,
    72.00,
    30,
    '[{"url": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80", "isCover": true, "alt": "Casamigos Reposado"}]'::jsonb,
    true,
    true,
    true,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'TEQ-ANE-001',
    'Patrón Añejo Tequila (750ml)',
    'patron-anejo-tequila-750ml',
    'Añejado por más de 12 meses en barricas de roble blanco francés y húngaro. Perfil cálido con toques de vainilla, pasas y miel.',
    69.00,
    NULL,
    25,
    '[{"url": "https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=600&q=80", "isCover": true, "alt": "Patrón Añejo"}]'::jsonb,
    true,
    false,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000004',
    'TEQ-CRI-001',
    'Don Julio 70 Cristalino Añejo (750ml)',
    'don-julio-70-cristalino-anejo-750ml',
    'El pionero de los tequilas cristalinos. Añejado 18 meses y filtrado con carbón activado para restaurar la pureza cítrica del agave.',
    78.00,
    88.00,
    20,
    '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true, "alt": "Don Julio 70 Cristalino"}]'::jsonb,
    true,
    true,
    true,
    5.0
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000005',
    'MEZ-ESP-001',
    '400 Conejos Mezcal Artesanal Espadín (750ml)',
    '400-conejos-mezcal-artesanal-espadin-750ml',
    'Elaborado artesanalmente en Oaxaca a partir de agave espadín cocido en hornos cónicos de leña. Aromas suaves de humo, madera y agave maduro.',
    38.00,
    44.00,
    40,
    '[{"url": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80", "isCover": true, "alt": "400 Conejos Mezcal"}]'::jsonb,
    true,
    true,
    false,
    4.7
  ),

  -- 2. WHISKY / WHISKEY
  (
    'c0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000006',
    'WHI-BOU-001',
    'Jack Daniel''s Old No. 7 Tennessee Whiskey (750ml)',
    'jack-daniels-old-no-7-tennessee-whiskey-750ml',
    'Filtrado gota a gota a través de 3 metros de carbón de arce de azúcar y madurado en barricas de roble americano hechas a mano.',
    28.00,
    32.00,
    60,
    '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true, "alt": "Jack Daniels Old No 7"}]'::jsonb,
    true,
    true,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000006',
    'WHI-BOU-002',
    'Maker''s Mark Kentucky Straight Bourbon (750ml)',
    'makers-mark-kentucky-straight-bourbon-750ml',
    'Bourbon artesanal destilado con trigo rojo de invierno en lugar de centeno, brindando un sabor extraordinariamente suave y notas de caramelo.',
    35.00,
    NULL,
    35,
    '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true, "alt": "Makers Mark Bourbon"}]'::jsonb,
    true,
    false,
    false,
    4.7
  ),
  (
    'c0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000007',
    'WHI-RYE-001',
    'Bulleit Rye 95 American Whiskey (750ml)',
    'bulleit-rye-95-american-whiskey-750ml',
    'Elaborado con un 95% de grano de centeno. Perfil especiado y limpio con matices de cereza, vainilla y final de roble picante.',
    36.00,
    42.00,
    25,
    '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true, "alt": "Bulleit Rye Whiskey"}]'::jsonb,
    true,
    false,
    true,
    4.6
  ),
  (
    'c0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000008',
    'WHI-SCO-001',
    'Johnnie Walker Black Label 12 Años (750ml)',
    'johnnie-walker-black-label-12-anos-750ml',
    'Blended Scotch icónico envejecido un mínimo de 12 años con whiskies de las 4 esquinas de Escocia. Notas de fruta dulce, vainilla y humo de turba.',
    42.00,
    48.00,
    50,
    '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true, "alt": "Johnnie Walker Black Label"}]'::jsonb,
    true,
    true,
    true,
    4.9
  ),
  (
    'c0000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000008',
    'WHI-SCO-002',
    'Buchanan''s DeLuxe 12 Años Blended Scotch (750ml)',
    'buchanans-deluxe-12-anos-blended-scotch-750ml',
    'Whisky escocés suave, sutil y afrutado con notas de naranja, chocolate y roble dulce.',
    40.00,
    NULL,
    40,
    '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true, "alt": "Buchanans DeLuxe 12 Años"}]'::jsonb,
    true,
    true,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000011',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000009',
    'WHI-IRI-001',
    'Jameson Irish Whiskey (750ml)',
    'jameson-irish-whiskey-750ml',
    'Triple destilación tradicional irlandesa para máxima suavidad. Toques de jerez, vainilla y notas florales delicadas.',
    26.00,
    30.00,
    55,
    '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true, "alt": "Jameson Irish Whiskey"}]'::jsonb,
    true,
    false,
    false,
    4.7
  ),
  (
    'c0000000-0000-0000-0000-000000000012',
    'a0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000010',
    'WHI-JAP-001',
    'Hibiki Japanese Harmony Whisky (700ml)',
    'hibiki-japanese-harmony-whisky-700ml',
    'Obra maestra de Suntory. Armonía refinada con aromas de rosa, lichi, romero y toques sutiles de madera de Mizunara (roble japonés).',
    115.00,
    130.00,
    15,
    '[{"url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80", "isCover": true, "alt": "Hibiki Japanese Harmony"}]'::jsonb,
    true,
    true,
    false,
    5.0
  ),

  -- 3. VODKA
  (
    'c0000000-0000-0000-0000-000000000013',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000011',
    'VOD-CLA-001',
    'Grey Goose Vodka Francés Premium (750ml)',
    'grey-goose-vodka-frances-premium-750ml',
    'Destilado en Francia con trigo blando de invierno de Picardía y agua pura de manantial de Gensac-la-Pallue. Textura sedosa excepcional.',
    38.00,
    45.00,
    35,
    '[{"url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80", "isCover": true, "alt": "Grey Goose Vodka"}]'::jsonb,
    true,
    true,
    false,
    4.9
  ),
  (
    'c0000000-0000-0000-0000-000000000014',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000011',
    'VOD-CLA-002',
    'Tito''s Handmade Vodka Texas (750ml)',
    'titos-handmade-vodka-texas-750ml',
    'Destilado en alambiques de cobre por lotes a partir de maíz 100% natural. Certificado sin gluten y de final excepcionalmente limpio.',
    24.00,
    NULL,
    50,
    '[{"url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80", "isCover": true, "alt": "Titos Handmade Vodka"}]'::jsonb,
    true,
    false,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000015',
    'a0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000012',
    'VOD-SAB-001',
    'Absolut Citron Vodka Saborizado (750ml)',
    'absolut-citron-vodka-saborizado-750ml',
    'El vodka favorito para preparar el clásico Cosmopolitan. Infusionado exclusivamente con esencias naturales de limón y lima sin azúcares añadidos.',
    24.00,
    28.00,
    30,
    '[{"url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80", "isCover": true, "alt": "Absolut Citron Vodka"}]'::jsonb,
    true,
    false,
    true,
    4.7
  ),

  -- 4. VINOS
  (
    'c0000000-0000-0000-0000-000000000016',
    'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000013',
    'VIN-TIN-001',
    'Catena Zapata Malbec Mendoza Reserva (750ml)',
    'catena-zapata-malbec-mendoza-reserva-750ml',
    'Vino tinto insignia argentino de viñedos de altura en Mendoza. Notas intensas de ciruela negra, vainilla, especias y taninos redondos aterciopelados.',
    28.00,
    34.00,
    40,
    '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true, "alt": "Catena Zapata Malbec"}]'::jsonb,
    true,
    true,
    true,
    4.9
  ),
  (
    'c0000000-0000-0000-0000-000000000017',
    'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000013',
    'VIN-TIN-002',
    'Casillero del Diablo Cabernet Sauvignon (750ml)',
    'casillero-del-diablo-cabernet-sauvignon-750ml',
    'Vino tinto chileno de Valle Central con notas de cereza madura, grosellas negras, café tostado y roble americano.',
    15.00,
    NULL,
    70,
    '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true, "alt": "Casillero del Diablo Cabernet"}]'::jsonb,
    true,
    false,
    false,
    4.6
  ),
  (
    'c0000000-0000-0000-0000-000000000018',
    'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000014',
    'VIN-BLA-001',
    'Kim Crawford Marlborough Sauvignon Blanc (750ml)',
    'kim-crawford-marlborough-sauvignon-blanc-750ml',
    'Vino blanco de Nueva Zelanda mundialmente aclamado. Explosión cítrica de maracuyá, pomelo y acidez crujiente refrescante.',
    22.00,
    26.00,
    35,
    '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true, "alt": "Kim Crawford Sauvignon Blanc"}]'::jsonb,
    true,
    true,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000019',
    'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000015',
    'VIN-ROS-001',
    'Whispering Angel Côtes de Provence Rosé (750ml)',
    'whispering-angel-cotes-de-provence-rose-750ml',
    'El referente mundial del vino rosado de la Provenza francesa. Rosa pálido, aromas de frutos rojos frescos y final sedoso.',
    27.00,
    NULL,
    25,
    '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true, "alt": "Whispering Angel Rosé"}]'::jsonb,
    true,
    false,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000020',
    'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000016',
    'VIN-ESP-001',
    'Moët & Chandon Impérial Brut Champagne (750ml)',
    'moet-chandon-imperial-brut-champagne-750ml',
    'El champagne icónico de la casa fundada en 1743. Elegante mezcla de Pinot Noir, Meunier y Chardonnay con burbuja fina y persistente.',
    58.00,
    65.00,
    30,
    '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true, "alt": "Moet Chandon Imperial Brut"}]'::jsonb,
    true,
    true,
    false,
    5.0
  ),
  (
    'c0000000-0000-0000-0000-000000000021',
    'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000017',
    'VIN-DUL-001',
    'Taylor''s Port Tawny 10 Años (750ml)',
    'taylors-port-tawny-10-anos-750ml',
    'Vino de Oporto fortificado envejecido en barricas de roble sazonadas. Aromas intensos de higos, nueces y pasas.',
    34.00,
    NULL,
    20,
    '[{"url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80", "isCover": true, "alt": "Taylors Port Tawny"}]'::jsonb,
    true,
    false,
    false,
    4.7
  ),

  -- 5. RON (RUM)
  (
    'c0000000-0000-0000-0000-000000000022',
    'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000018',
    'RON-BLA-001',
    'Bacardí Carta Blanca Superior Rum (750ml)',
    'bacardi-carta-blanca-superior-rum-750ml',
    'Ron blanco clásico creado en 1862. Añejado en barricas de roble blanco y filtrado dos veces con carbón para lograr notas florales y frutales ligeras.',
    17.00,
    NULL,
    80,
    '[{"url": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80", "isCover": true, "alt": "Bacardi Carta Blanca"}]'::jsonb,
    true,
    false,
    false,
    4.7
  ),
  (
    'c0000000-0000-0000-0000-000000000023',
    'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000019',
    'RON-ANE-001',
    'Ron Zacapa Centenario 23 Solera Gran Reserva (750ml)',
    'ron-zacapa-centenario-23-solera-gran-reserva-750ml',
    'Ron de las tierras altas de Guatemala añejado por sistema de solera a 2300m sobre el nivel del mar. Complejas notas de caramelo, miel y roble.',
    54.00,
    62.00,
    30,
    '[{"url": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80", "isCover": true, "alt": "Ron Zacapa 23"}]'::jsonb,
    true,
    true,
    true,
    5.0
  ),
  (
    'c0000000-0000-0000-0000-000000000024',
    'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000019',
    'RON-ANE-002',
    'Ron Medellín Extra Añejo 8 Años (750ml)',
    'ron-medellin-extra-anejo-8-anos-750ml',
    'Ron colombiano añejado pacientemente durante 8 años en barriles de roble americano. Notas cálidas de vainilla y miel.',
    24.00,
    NULL,
    60,
    '[{"url": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80", "isCover": true, "alt": "Ron Medellin 8 Anos"}]'::jsonb,
    true,
    true,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000025',
    'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000020',
    'RON-ESP-001',
    'Captain Morgan Original Spiced Gold (750ml)',
    'captain-morgan-original-spiced-gold-750ml',
    'Ron especiado caribeño infusionado con vainilla natural, azúcar morena y especias cálidas. Perfecto con cola y limón.',
    19.00,
    22.00,
    50,
    '[{"url": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80", "isCover": true, "alt": "Captain Morgan Spiced"}]'::jsonb,
    true,
    false,
    false,
    4.7
  ),

  -- 6. BRANDY & COÑAC (COGNAC)
  (
    'c0000000-0000-0000-0000-000000000026',
    'a0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000021',
    'COG-VS-001',
    'Hennessy VS Very Special Cognac (750ml)',
    'hennessy-vs-very-special-cognac-750ml',
    'El cognac más popular del mundo. Ensamblado con más de 40 aguardientes eaux-de-vie envejecidos en barricas nuevas de roble francés.',
    48.00,
    55.00,
    30,
    '[{"url": "https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=600&q=80", "isCover": true, "alt": "Hennessy VS Cognac"}]'::jsonb,
    true,
    true,
    false,
    4.9
  ),
  (
    'c0000000-0000-0000-0000-000000000027',
    'a0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000022',
    'COG-VSO-001',
    'Rémy Martin VSOP Fine Champagne Cognac (750ml)',
    'remy-martin-vsop-fine-champagne-cognac-750ml',
    'Destilado exclusivamente de uvas de Grande y Petite Champagne. Notas elegantes de albaricoque maduro, vainilla y regaliz.',
    65.00,
    NULL,
    20,
    '[{"url": "https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=600&q=80", "isCover": true, "alt": "Remy Martin VSOP"}]'::jsonb,
    true,
    false,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000028',
    'a0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000024',
    'BRA-ESP-001',
    'Torres 10 Gran Reserva Brandy Español (700ml)',
    'torres-10-gran-reserva-brandy-espanol-700ml',
    'Brandy de solera añejado en barricas de roble americano en el Penedès. Notas aromáticas de canela, vainilla y frutos secos.',
    22.00,
    26.00,
    40,
    '[{"url": "https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=600&q=80", "isCover": true, "alt": "Torres 10 Brandy"}]'::jsonb,
    true,
    false,
    true,
    4.7
  ),

  -- 7. CERVEZAS Y RTD (READY TO DRINK)
  (
    'c0000000-0000-0000-0000-000000000029',
    'a0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000025',
    'CER-IMP-001',
    'Corona Extra Cerveza Clara (Pack 6 x 355ml)',
    'corona-extra-cerveza-clara-pack-6-x-355ml',
    'La cerveza mexicana más vendida del mundo. Ligera, refrescante, balanceada con notas de malta y lúpulo. Servir con rodaja de lima.',
    11.50,
    NULL,
    100,
    '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true, "alt": "Corona Extra Pack 6"}]'::jsonb,
    true,
    true,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000030',
    'a0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000025',
    'CER-IMP-002',
    'Heineken Original Lager Premium (Pack 6 x 330ml)',
    'heineken-original-lager-premium-pack-6-x-330ml',
    'Lager holandesa 100% de malta pura fermentada con levadura tipo A patentada. Sabor balanceado y refrescante.',
    12.00,
    14.00,
    90,
    '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true, "alt": "Heineken Lager Pack 6"}]'::jsonb,
    true,
    false,
    true,
    4.7
  ),
  (
    'c0000000-0000-0000-0000-000000000031',
    'a0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000026',
    'CER-ART-001',
    'Sierra Nevada Hazy Little Thing IPA (Pack 6 x 355ml)',
    'sierra-nevada-hazy-little-thing-ipa-pack-6-x-355ml',
    'Cerveza artesanal estilo New England Hazy IPA sin filtrar. Aromas tropicales jugosos a lúpulos Citra y Mosaic.',
    14.00,
    NULL,
    45,
    '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true, "alt": "Sierra Nevada Hazy Little Thing IPA"}]'::jsonb,
    true,
    false,
    false,
    4.8
  ),
  (
    'c0000000-0000-0000-0000-000000000032',
    'a0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000027',
    'RTD-SEL-001',
    'High Noon Sun Sips Vodka Hard Seltzer (Pack 8 x 355ml)',
    'high-noon-sun-sips-vodka-hard-seltzer-pack-8-x-355ml',
    'Elaborado con vodka real destilado, zumo de fruta natural y agua con gas. Sabores piña, sandía, pomelo y cereza negra. Sin azúcar añadida.',
    19.99,
    22.99,
    50,
    '[{"url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80", "isCover": true, "alt": "High Noon Hard Seltzer"}]'::jsonb,
    true,
    true,
    true,
    4.9
  ),

  -- 8. LICORES, CREMAS Y TRADICIONALES
  (
    'c0000000-0000-0000-0000-000000000033',
    'a0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000028',
    'LIC-AGU-001',
    'Aguardiente Antioqueño Tapa Azul Sin Azúcar (750ml)',
    'aguardiente-antioqueno-tapa-azul-sin-azucar-750ml',
    'El licor tradicional número 1 de Colombia. Destilado con alcoholes extra neutros y esencias de anís natural, 0% azúcar añadida.',
    18.00,
    NULL,
    120,
    '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true, "alt": "Aguardiente Antioqueno Tapa Azul"}]'::jsonb,
    true,
    true,
    false,
    5.0
  ),
  (
    'c0000000-0000-0000-0000-000000000034',
    'a0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000029',
    'LIC-CRE-001',
    'Baileys Original Irish Cream Liqueur (750ml)',
    'baileys-original-irish-cream-liqueur-750ml',
    'La crema irlandesa original que combina whisky irlandés triple destilado, crema de leche fresca y aromas de cacao y vainilla.',
    23.00,
    26.00,
    60,
    '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true, "alt": "Baileys Original Irish Cream"}]'::jsonb,
    true,
    true,
    false,
    4.9
  ),
  (
    'c0000000-0000-0000-0000-000000000035',
    'a0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000029',
    'LIC-CRE-002',
    'Kahlúa Original Coffee Liqueur (750ml)',
    'kahlua-original-coffee-liqueur-750ml',
    'Licor de café mexicano premium elaborado con granos de café 100% arábica y ron de caña. Esencial para White Russian y Espresso Martini.',
    21.00,
    NULL,
    40,
    '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true, "alt": "Kahlua Coffee Liqueur"}]'::jsonb,
    true,
    false,
    false,
    4.7
  ),
  (
    'c0000000-0000-0000-0000-000000000036',
    'a0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000030',
    'LIC-DIG-001',
    'Jägermeister Herbal Liqueur (750ml)',
    'jagermeister-herbal-liqueur-750ml',
    'Legendario licor digestivo alemán macerado con 56 hierbas, flores, raíces y frutas seleccionadas. Servir a -18°C.',
    27.00,
    31.00,
    70,
    '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true, "alt": "Jagermeister Herbal Liqueur"}]'::jsonb,
    true,
    true,
    true,
    4.9
  ),
  (
    'c0000000-0000-0000-0000-000000000037',
    'a0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000030',
    'LIC-DIG-002',
    'Aperol Aperitivo Italiano (750ml)',
    'aperol-aperitivo-italiano-750ml',
    'El corazón del cóctel Aperol Spritz. Receta secreta de Padua con infusiones de naranjas dulces y amargas, hierbas aromáticas y ruibarbo.',
    25.00,
    NULL,
    55,
    '[{"url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "isCover": true, "alt": "Aperol Aperitivo"}]'::jsonb,
    true,
    true,
    false,
    4.8
  )
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  subcategory_id = EXCLUDED.subcategory_id,
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  stock_quantity = EXCLUDED.stock_quantity,
  images = EXCLUDED.images,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  is_offer = EXCLUDED.is_offer,
  rating = EXCLUDED.rating,
  updated_at = now();

COMMIT;
