import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const adminService = {
  async createUser(email: string, password: string, fullName: string, role: string = 'user') {
    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, referral_code, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, referral_code, role, created_at`,
      [email, passwordHash, fullName, referralCode, role]
    );

    return result.rows[0];
  },

  async awardCoins(userId: number, amount: number, description: string, expiryDays?: number, observations?: string) {
    let expiresAt: Date | null = null;

    if (expiryDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, description, observations, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [userId, amount, 'admin_award', description, observations || null, expiresAt]
    );

    return result.rows[0];
  },

  async getAllUsers(limit: number = 50, offset: number = 0) {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.referral_code, u.role, u.created_at,
              (SELECT COUNT(*) FROM referrals WHERE referrer_id = u.id) as referral_count,
              COALESCE((
                SELECT SUM(CASE WHEN type IN ('earn', 'admin_award', 'referral') AND expired = false THEN amount ELSE 0 END) -
                       SUM(CASE WHEN type IN ('spend', 'expire') THEN amount ELSE 0 END)
                FROM transactions WHERE user_id = u.id
              ), 0) as balance
       FROM users u
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  },

  async searchUsers(query: string) {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.referral_code, u.role,
              COALESCE((
                SELECT SUM(CASE WHEN type IN ('earn', 'admin_award', 'referral') AND expired = false THEN amount ELSE 0 END) -
                       SUM(CASE WHEN type IN ('spend', 'expire') THEN amount ELSE 0 END)
                FROM transactions WHERE user_id = u.id
              ), 0) as balance
       FROM users u
       WHERE u.email ILIKE $1 OR u.full_name ILIKE $1
       LIMIT 20`,
      [`%${query}%`]
    );

    return result.rows;
  },

  async createProduct(name: string, description: string, price: number, type: string) {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, price, type]
    );

    return result.rows[0];
  },

  async updateProduct(productId: number, updates: any) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(updates.price);
    }
    if (updates.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(updates.type);
    }
    if (updates.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(updates.active);
    }

    values.push(productId);

    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  async getStats() {
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = $1', ['user']);
    const coinsResult = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN type IN ('earn', 'admin_award', 'referral') THEN amount ELSE 0 END), 0) as total_issued,
              COALESCE(SUM(CASE WHEN type = 'spend' THEN amount ELSE 0 END), 0) as total_spent
       FROM transactions`
    );
    const ordersResult = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = $1', ['completed']);

    return {
      totalUsers: parseInt(usersResult.rows[0].total),
      totalCoinsIssued: parseInt(coinsResult.rows[0].total_issued),
      totalCoinsSpent: parseInt(coinsResult.rows[0].total_spent),
      totalOrders: parseInt(ordersResult.rows[0].total)
    };
  },

  async getAllProducts() {
    const result = await pool.query(
      `SELECT * FROM products ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async deleteProduct(productId: number) {
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [productId]
    );
    return result.rows[0];
  },

  async getAllTransactions(limit: number = 100, offset: number = 0) {
    const result = await pool.query(
      `SELECT t.*, u.email, u.full_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  async getAllOrders(limit: number = 100, offset: number = 0) {
    const result = await pool.query(
      `SELECT o.*, u.email, u.full_name, p.name as product_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN products p ON o.product_id = p.id
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  async getUserDetails(userId: number) {
    const userResult = await pool.query(
      `SELECT u.*,
              (SELECT COUNT(*) FROM referrals WHERE referrer_id = u.id) as total_referrals,
              (SELECT COUNT(*) FROM orders WHERE user_id = u.id AND status = 'completed') as total_orders,
              COALESCE((
                SELECT SUM(CASE WHEN type IN ('earn', 'admin_award', 'referral') AND expired = false THEN amount ELSE 0 END) -
                       SUM(CASE WHEN type IN ('spend', 'expire') THEN amount ELSE 0 END)
                FROM transactions WHERE user_id = u.id
              ), 0) as balance
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const transactionsResult = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    const ordersResult = await pool.query(
      `SELECT o.*, p.name as product_name FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
      [userId]
    );

    return {
      user: userResult.rows[0],
      transactions: transactionsResult.rows,
      orders: ordersResult.rows
    };
  },

  async getAnalytics() {
    // User growth
    const userGrowth = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // Transaction trends
    const transactionTrends = await pool.query(
      `SELECT DATE(created_at) as date, type, COUNT(*) as count, SUM(amount) as total
       FROM transactions
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at), type
       ORDER BY date DESC`
    );

    // Top users by coins
    const topUsers = await pool.query(
      `SELECT u.id, u.full_name, u.email,
              COALESCE((
                SELECT SUM(CASE WHEN type IN ('earn', 'admin_award', 'referral') AND expired = false THEN amount ELSE 0 END) -
                       SUM(CASE WHEN type IN ('spend', 'expire') THEN amount ELSE 0 END)
                FROM transactions WHERE user_id = u.id
              ), 0) as balance
       FROM users u
       WHERE u.role = 'user'
       ORDER BY balance DESC
       LIMIT 10`
    );

    // Popular products
    const popularProducts = await pool.query(
      `SELECT p.*, COUNT(o.id) as purchase_count, SUM(o.coins_spent) as total_revenue
       FROM products p
       LEFT JOIN orders o ON p.id = o.product_id AND o.status = 'completed'
       GROUP BY p.id
       ORDER BY purchase_count DESC
       LIMIT 10`
    );

    return {
      userGrowth: userGrowth.rows,
      transactionTrends: transactionTrends.rows,
      topUsers: topUsers.rows,
      popularProducts: popularProducts.rows
    };
  },

  // Rewards CRUD
  async createReward(amount: number, eventTitle: string, defaultExpiryDays?: number) {
    const result = await pool.query(
      `INSERT INTO rewards (amount, event_title, default_expiry_days)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [amount, eventTitle, defaultExpiryDays || 180]
    );
    return result.rows[0];
  },

  async getAllRewards() {
    const result = await pool.query(
      `SELECT * FROM rewards ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async updateReward(rewardId: number, updates: any) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.amount !== undefined) {
      fields.push(`amount = $${paramCount++}`);
      values.push(updates.amount);
    }
    if (updates.event_title !== undefined) {
      fields.push(`event_title = $${paramCount++}`);
      values.push(updates.event_title);
    }
    if (updates.default_expiry_days !== undefined) {
      fields.push(`default_expiry_days = $${paramCount++}`);
      values.push(updates.default_expiry_days);
    }
    if (updates.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(updates.active);
    }

    values.push(rewardId);

    const result = await pool.query(
      `UPDATE rewards SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  async deleteReward(rewardId: number) {
    const result = await pool.query(
      `DELETE FROM rewards WHERE id = $1 RETURNING *`,
      [rewardId]
    );
    return result.rows[0];
  }
};
