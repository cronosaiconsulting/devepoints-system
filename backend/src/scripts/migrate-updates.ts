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

    console.log('✅ Schema updates completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateUpdates();
