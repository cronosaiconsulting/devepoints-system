import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function seed() {
  console.log('Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const adminCode = generateReferralCode();

    await pool.query(`
      INSERT INTO users (email, password_hash, full_name, referral_code, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [
      process.env.ADMIN_EMAIL || 'admin@develand.com',
      adminPassword,
      'Admin User',
      adminCode,
      'admin'
    ]);
    console.log('✓ Admin user created');

    // Create sample products
    const products = [
      { name: '10% Discount Coupon', description: '10% off your next service', price: 500, type: 'discount' },
      { name: '20% Discount Coupon', description: '20% off your next service', price: 1000, type: 'discount' },
      { name: 'Free Consultation', description: '30-minute free consultation', price: 800, type: 'service' },
      { name: 'Premium Support (1 Month)', description: 'Priority support for 1 month', price: 1500, type: 'service' },
      { name: 'Development Package', description: '5 hours of development work', price: 3000, type: 'service' }
    ];

    for (const product of products) {
      await pool.query(`
        INSERT INTO products (name, description, price, type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [product.name, product.description, product.price, product.type]);
    }
    console.log('✓ Sample products created');

    // Create test user
    const testPassword = await bcrypt.hash('test123', 10);
    const testCode = generateReferralCode();

    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, full_name, referral_code)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['test@example.com', testPassword, 'Test User', testCode]);

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;

      // Add sample transactions
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 180);

      await pool.query(`
        INSERT INTO transactions (user_id, amount, type, description, expires_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, 100, 'admin_award', 'Welcome bonus', expiryDate]);

      console.log('✓ Test user and transactions created');
    }

    console.log('✅ Seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@develand.com'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('User: test@example.com / test123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
