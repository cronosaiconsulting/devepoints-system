import { pool } from '../config/database';
import { userService } from './userService';

export const storeService = {
  async getProducts() {
    const result = await pool.query(
      `SELECT id, name, description, price, type, created_at
       FROM products
       WHERE active = true
       ORDER BY price ASC`
    );

    return result.rows;
  },

  async purchaseProduct(userId: number, productId: number) {
    // Get product
    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND active = true',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new Error('Product not found or inactive');
    }

    const product = productResult.rows[0];

    // Check user balance
    const balance = await userService.getBalance(userId);

    if (balance < product.price) {
      throw new Error('Insufficient balance');
    }

    // Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, product_id, coins_spent, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [userId, productId, product.price, 'completed']
    );

    // Deduct coins
    await pool.query(
      `INSERT INTO transactions (user_id, amount, type, description)
       VALUES ($1, $2, $3, $4)`,
      [userId, product.price, 'spend', `Purchased: ${product.name}`]
    );

    return {
      orderId: orderResult.rows[0].id,
      product: product,
      coinsSpent: product.price,
      createdAt: orderResult.rows[0].created_at
    };
  },

  async getOrderHistory(userId: number) {
    const result = await pool.query(
      `SELECT o.id, o.coins_spent, o.status, o.created_at,
              p.name as product_name, p.description as product_description, p.type as product_type
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return result.rows;
  }
};
