-- Check if the precious-metals category already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM asset_categories WHERE slug = 'precious-metals') THEN
        INSERT INTO asset_categories (name, slug, description, icon)
        VALUES ('Precious Metals', 'precious-metals', 'Gold, silver, platinum, and other precious metals', 'database');
    END IF;
END
$$;