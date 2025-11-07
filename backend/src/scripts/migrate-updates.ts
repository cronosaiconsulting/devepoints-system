import { pool } from '../config/database';

async function migrateUpdates() {
  console.log('Starting schema updates migration...');

  try {
    // 1. Drop old constraint and add new product types
    await pool.query(`
      ALTER TABLE products
      DROP CONSTRAINT IF EXISTS products_type_check;
    `);
    console.log('✓ Dropped old product type constraint');

    await pool.query(`
      ALTER TABLE products
      ADD CONSTRAINT products_type_check
      CHECK (type IN ('standard', 'promotion', 'free'));
    `);
    console.log('✓ Added new product type constraint (standard, promotion, free)');

    // 2. Add real_price field (decimal for euro price)
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS real_price DECIMAL(10,2);
    `);
    console.log('✓ Added real_price column');

    // 3. Add max_tokens field for free-type products
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS max_tokens INTEGER;
    `);
    console.log('✓ Added max_tokens column');

    // 4. Add refund fields to transactions
    await pool.query(`
      ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE;
    `);
    console.log('✓ Added refunded column');

    await pool.query(`
      ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS refund_of INTEGER REFERENCES transactions(id);
    `);
    console.log('✓ Added refund_of column');

    // 5. Add indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_refunded
      ON transactions(refunded);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_refund_of
      ON transactions(refund_of);
    `);
    console.log('✓ Added refund indexes');

    // 6. Update existing products with real_price (same as token price for now)
    await pool.query(`
      UPDATE products
      SET real_price = price
      WHERE real_price IS NULL;
    `);
    console.log('✓ Updated existing products with real_price');

    // 7. Add token_offers column for products
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS token_offers JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✓ Added token_offers column');

    // 8. Add image_url column for products
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
    `);
    console.log('✓ Added image_url column');

    // 9. Add logo_url setting
    await pool.query(`
      INSERT INTO settings (key, value, description)
      VALUES ('logo_url', '', 'URL del logo principal (usar IMGUR)')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✓ Added logo_url setting');

    // 10. Add money_paid column to orders
    await pool.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS money_paid DECIMAL(10,2) DEFAULT 0;
    `);
    console.log('✓ Added money_paid column to orders');

    // 11. Add description column to rewards
    await pool.query(`
      ALTER TABLE rewards
      ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
    `);
    console.log('✓ Added description column to rewards');

    // 12. Update existing rewards to have empty description
    await pool.query(`
      UPDATE rewards
      SET description = ''
      WHERE description IS NULL;
    `);
    console.log('✓ Updated existing rewards with empty description');

    // 13. Rename referral_tokens to tokens_per_referral
    await pool.query(`
      UPDATE settings
      SET key = 'tokens_per_referral'
      WHERE key = 'referral_tokens';
    `);
    console.log('✓ Renamed referral_tokens to tokens_per_referral');

    // 14. Ensure referral_bonus_new_user setting exists
    await pool.query(`
      INSERT INTO settings (key, value, description)
      VALUES ('referral_bonus_new_user', '25', 'Tokens de bonificación para nuevos usuarios referidos')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✓ Ensured referral_bonus_new_user setting exists');

    // 15. Ensure tokens_per_referral setting exists (in case it was never created)
    await pool.query(`
      INSERT INTO settings (key, value, description)
      VALUES ('tokens_per_referral', '50', 'Cantidad de tokens que gana el referidor por cada referido exitoso')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✓ Ensured tokens_per_referral setting exists');

    // 16. Add terms_and_conditions setting
    await pool.query(`
      INSERT INTO settings (key, value, description)
      VALUES ('terms_and_conditions', '<h2>Términos y Condiciones</h2><p>Aquí van los términos y condiciones de uso del sistema.</p>', 'Términos y condiciones del sistema (HTML)')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✓ Added terms_and_conditions setting');

    console.log('✅ Schema updates completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateUpdates();
