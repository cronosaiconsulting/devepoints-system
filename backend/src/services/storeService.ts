import { pool } from '../config/database';
import { userService } from './userService';

export const storeService = {
  async getProducts() {
    try {
      // Try with token_offers and image_url columns
      const result = await pool.query(
        `SELECT id, name, description, price, real_price, max_tokens, type, token_offers, image_url, created_at
         FROM products
         WHERE active = true
         ORDER BY price ASC`
      );
      return result.rows;
    } catch (error: any) {
      // If columns don't exist, query without them
      if (error.code === '42703') {
        const result = await pool.query(
          `SELECT id, name, description, price, real_price, max_tokens, type, created_at
           FROM products
           WHERE active = true
           ORDER BY price ASC`
        );
        return result.rows.map((row: any) => ({ ...row, token_offers: [], image_url: '' }));
      }
      throw error;
    }
  },

  async purchaseProduct(userId: number, productId: number, tokensSpent?: number, moneyPaid?: number) {
    // Get product
    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND active = true',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new Error('Product not found or inactive');
    }

    const product = productResult.rows[0];

    // Determine actual tokens to spend
    const actualTokensSpent = tokensSpent || product.price;

    // For 'free' type products, validate tokensSpent
    if (product.type === 'free') {
      if (!tokensSpent || tokensSpent <= 0) {
        throw new Error('Must specify tokens to spend for free products');
      }
      const maxTokens = product.max_tokens || Math.floor((product.real_price || product.price) * 0.5);
      if (tokensSpent > maxTokens) {
        throw new Error(`Cannot spend more than ${maxTokens} tokens on this product`);
      }
    }

    // Check user balance
    const balance = await userService.getBalance(userId);

    if (balance < actualTokensSpent) {
      throw new Error('Insufficient balance');
    }

    // Calculate money_paid
    // If provided by frontend (from token offer), use it
    // Otherwise calculate as (remaining price after tokens)
    const realPrice = product.real_price || product.price;
    const actualMoneyPaid = moneyPaid !== undefined ? moneyPaid : Math.max(0, realPrice - actualTokensSpent);

    // Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, product_id, coins_spent, money_paid, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [userId, productId, actualTokensSpent, actualMoneyPaid, 'completed']
    );

    // Deduct coins
    await pool.query(
      `INSERT INTO transactions (user_id, amount, type, description)
       VALUES ($1, $2, $3, $4)`,
      [userId, actualTokensSpent, 'spend', `Purchased: ${product.name}`]
    );

    return {
      orderId: orderResult.rows[0].id,
      product: product,
      coinsSpent: actualTokensSpent,
      remainingPrice: (product.real_price || product.price) - actualTokensSpent,
      createdAt: orderResult.rows[0].created_at
    };
  },

  async getOrderHistory(userId: number) {
    try {
      // Try with money_paid column
      const result = await pool.query(
        `SELECT o.id, o.coins_spent, o.money_paid, o.status, o.created_at,
                p.name as product_name, p.description as product_description, p.type as product_type
         FROM orders o
         JOIN products p ON o.product_id = p.id
         WHERE o.user_id = $1
         ORDER BY o.created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error: any) {
      // If money_paid column doesn't exist, query without it
      if (error.code === '42703') {
        const result = await pool.query(
          `SELECT o.id, o.coins_spent, o.status, o.created_at,
                  p.name as product_name, p.description as product_description, p.type as product_type
           FROM orders o
           JOIN products p ON o.product_id = p.id
           WHERE o.user_id = $1
           ORDER BY o.created_at DESC`,
          [userId]
        );
        return result.rows.map((row: any) => ({ ...row, money_paid: null }));
      }
      throw error;
    }
  }
};
