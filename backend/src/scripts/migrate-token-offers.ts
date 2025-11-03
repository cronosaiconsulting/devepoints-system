import { pool } from '../config/database';

async function migrateTokenOffers() {
  try {
    console.log('Adding token_offers column to products table...');

    // Add token_offers JSONB column to products table
    await pool.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS token_offers JSONB DEFAULT '[]'::jsonb
    `);

    console.log('token_offers column added successfully');
    console.log('Migration completed!');

    // Example of token_offers structure:
    // [
    //   { tokens: 100, money: 50.00, summary: "100 Tokens + 50,00€" },
    //   { tokens: 200, money: 40.00, summary: "200 Tokens + 40,00€" },
    //   { tokens: 300, money: 30.00, summary: "300 Tokens + 30,00€" }
    // ]

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateTokenOffers();
