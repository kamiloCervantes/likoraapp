
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'estuches-de-regalo-experiencias-santafe')
WHERE sku = 'SNT-REG-001';

UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'cava-privada-anadas-historicas-llanogrande')
WHERE sku = 'LLA-RES-001';

UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'combos-rumberos-24-7-hielo-guayabal')
WHERE sku IN ('GUA-COM-001', 'GUA-HIE-001');

-- If SNT-REG-001 wasn't inserted due to that error, insert it now:
INSERT INTO products (
    id, store_id, category_id, subcategory_id, sku, name, slug, description,
    price, compare_at_price, stock_quantity, images, is_featured, is_offer, rating, is_active, created_at, updated_at
) VALUES (
    uuid_generate_v4(),
    '3e97431a-5307-4e66-9a1b-64e397b8c5f8',
    (SELECT id FROM categories WHERE slug = 'estuches-de-regalo-experiencias-santafe'),
    NULL,
    'SNT-REG-001',
    'Cofre Regalo Gin Hendrick''s + Vaso Highball Tallado',
    'cofre-regalo-gin-hendricks-santafe',
    'Edición especial para obsequio con botella de Hendrick''s 700ml y vaso de cristal botánico tallado.',
    56.00, 65.00, 18,
    '[{"url": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&q=80", "isCover": true}]'::jsonb,
    true, true, 4.97, true, NOW(), NOW()
) ON CONFLICT (sku) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    store_id = EXCLUDED.store_id,
    updated_at = NOW();
