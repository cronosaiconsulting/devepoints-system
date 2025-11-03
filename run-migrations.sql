-- Migration 1: Add token_offers column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS token_offers JSONB DEFAULT '[]'::jsonb;

-- Migration 2: Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description)
VALUES
  ('referral_tokens', '50', 'Tokens otorgados por referido registrado'),
  ('expiring_soon_days', '30', 'Días para considerar que los tokens expiran pronto (para notificaciones)')
ON CONFLICT (key) DO NOTHING;

-- Verify migrations
SELECT 'token_offers column added to products' AS status;
SELECT 'settings table created with default values' AS status;
SELECT COUNT(*) AS settings_count FROM settings;
