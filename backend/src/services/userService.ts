import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../types';

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const userService = {
  async register(email: string, password: string, fullName: string, referredByCode?: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();

    let referrerId: number | null = null;

    if (referredByCode) {
      const referrerResult = await pool.query(
        'SELECT id FROM users WHERE referral_code = $1',
        [referredByCode]
      );
      if (referrerResult.rows.length > 0) {
        referrerId = referrerResult.rows[0].id;
      }
    }

    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, full_name, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, referral_code, role, created_at`,
      [email, passwordHash, fullName, referralCode, referrerId]
    );

    const user = result.rows[0];

    // Award coins to new user (referred bonus)
    if (referrerId) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(process.env.DEFAULT_COIN_EXPIRY_DAYS || '180'));

      // Award coins to new user
      await pool.query(
        `INSERT INTO transactions (user_id, amount, type, description, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, parseInt(process.env.REFERRED_USER_BONUS_COINS || '50'), 'referral', 'Signup bonus for using referral code', expiryDate]
      );

      // Award coins to referrer
      await pool.query(
        `INSERT INTO transactions (user_id, amount, type, description, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [referrerId, parseInt(process.env.REFERRAL_REWARD_COINS || '100'), 'referral', `Referral bonus for inviting ${fullName}`, expiryDate]
      );

      // Log referral
      await pool.query(
        `INSERT INTO referrals (referrer_id, referred_id, reward_amount)
         VALUES ($1, $2, $3)`,
        [referrerId, user.id, parseInt(process.env.REFERRAL_REWARD_COINS || '100')]
      );
    }

    return user;
  },

  async login(email: string, password: string) {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    return { token, user: { id: user.id, email: user.email, fullName: user.full_name, referralCode: user.referral_code, role: user.role } };
  },

  async getBalance(userId: number) {
    const result = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type IN ('earn', 'admin_award', 'referral') AND expired = false AND (refunded = false OR refunded IS NULL) THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type IN ('spend', 'expire') AND (refunded = false OR refunded IS NULL) THEN amount ELSE 0 END), 0) as balance
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    );

    return parseInt(result.rows[0].balance) || 0;
  },

  async getTransactionHistory(userId: number) {
    const result = await pool.query(
      `SELECT id, amount, type, description, expires_at, expired, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );

    return result.rows;
  },

  async getExpiringCoins(userId: number, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const result = await pool.query(
      `SELECT SUM(amount) as expiring_amount, expires_at
       FROM transactions
       WHERE user_id = $1
         AND type IN ('earn', 'admin_award', 'referral')
         AND expired = false
         AND expires_at IS NOT NULL
         AND expires_at <= $2
       GROUP BY expires_at
       ORDER BY expires_at`,
      [userId, futureDate]
    );

    return result.rows;
  },

  async getReferralStats(userId: number) {
    const result = await pool.query(
      `SELECT COUNT(*) as total_referrals, COALESCE(SUM(reward_amount), 0) as total_earned
       FROM referrals
       WHERE referrer_id = $1`,
      [userId]
    );

    return result.rows[0];
  }
};
