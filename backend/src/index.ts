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

    res.json({
      success: true,
      message: 'Admin user reset successfully',
      email: newEmail,
      password: newPassword
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
