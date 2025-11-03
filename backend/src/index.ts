import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import storeRoutes from './routes/storeRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - required for Railway/reverse proxy setups
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Temporary admin reset endpoint - REMOVE AFTER USE
app.post('/reset-admin-temp', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { pool } = require('./config/database');

    // Step 1: Run schema migrations
    try {
      await pool.query(`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;`);
      await pool.query(`ALTER TABLE products ADD CONSTRAINT products_type_check CHECK (type IN ('standard', 'promotion', 'free'));`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS real_price DECIMAL(10,2);`);
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS max_tokens INTEGER;`);
      await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE;`);
      await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS refund_of INTEGER REFERENCES transactions(id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_refunded ON transactions(refunded);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_refund_of ON transactions(refund_of);`);
      await pool.query(`UPDATE products SET real_price = price WHERE real_price IS NULL;`);
    } catch (migError) {
      console.log('Migration warning (might be already applied):', migError);
    }

    const newEmail = 'juanma@develand.es';
    const newPassword = '1234';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Delete existing admin
    await pool.query(`DELETE FROM users WHERE role = 'admin'`);

    // Create new admin
    await pool.query(`
      INSERT INTO users (email, password_hash, full_name, referral_code, role)
      VALUES ($1, $2, $3, $4, $5)
    `, [newEmail, hashedPassword, 'Admin User', referralCode, 'admin']);

    // Create default products (SAEL and Experto en Coaching for beta)
    // Note: 1 token = 1€, max slider for 'free' type = 50% of price
    const products = [
      { name: 'SAEL', description: 'Sistema Avanzado de Entrenamiento de Liderazgo', price: 1390, real_price: 1390, max_tokens: 695, type: 'standard' },
      { name: 'Experto en Coaching', description: 'Programa completo de certificación en Coaching', price: 1590, real_price: 1590, max_tokens: 795, type: 'standard' },
      { name: '10% Discount Coupon', description: '10% off your next service', price: 50, real_price: 50, max_tokens: null, type: 'promotion' },
      { name: '20% Discount Coupon', description: '20% off your next service', price: 100, real_price: 100, max_tokens: null, type: 'promotion' },
      { name: 'Free Consultation', description: '30-minute free consultation', price: 80, real_price: 80, max_tokens: null, type: 'standard' },
    ];

    for (const product of products) {
      await pool.query(`
        INSERT INTO products (name, description, price, real_price, max_tokens, type)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [product.name, product.description, product.price, product.real_price, product.max_tokens, product.type]);
    }

    // Create default rewards
    const rewards = [
      { amount: 5, event_title: 'Staff Possibility', default_expiry_days: 365 },
      { amount: 10, event_title: 'Staff Infinity', default_expiry_days: 365 },
      { amount: 200, event_title: 'Reto 7 días', default_expiry_days: 365 }
    ];

    for (const reward of rewards) {
      await pool.query(`
        INSERT INTO rewards (amount, event_title, default_expiry_days)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [reward.amount, reward.event_title, reward.default_expiry_days]);
    }

    res.json({
      success: true,
      message: 'Admin user, products, and rewards created successfully',
      email: newEmail,
      password: newPassword,
      products_created: products.length,
      rewards_created: rewards.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 DevePoints API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
