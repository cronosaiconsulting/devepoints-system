import { pool } from '../config/database';

async function migrate() {
  try {
    console.log('Adding money_paid column to orders table...');

    await pool.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS money_paid DECIMAL(10, 2) DEFAULT 0;
    `);

    console.log('✅ money_paid column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
