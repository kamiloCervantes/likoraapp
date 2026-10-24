
ALTER TABLE categories ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE SET NULL;

-- Associate existing categories and products with the flagship store
UPDATE categories SET store_id = '3ea32522-c707-4f18-b875-f689c7c815f2' WHERE store_id IS NULL;
UPDATE products SET store_id = '3ea32522-c707-4f18-b875-f689c7c815f2' WHERE store_id IS NULL;
