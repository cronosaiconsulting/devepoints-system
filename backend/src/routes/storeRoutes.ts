import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { storeService } from '../services/storeService';
import { pdfService } from '../services/pdfService';
import { pool } from '../config/database';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

router.get('/products', async (req, res) => {
  try {
    const products = await storeService.getProducts();
    res.json({ success: true, products });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const purchaseSchema = z.object({
  productId: z.number(),
  tokensSpent: z.number().positive().optional(),
  moneyPaid: z.number().min(0).optional()
});

router.post('/purchase', async (req, res) => {
  try {
    const { productId, tokensSpent, moneyPaid } = purchaseSchema.parse(req.body);
    const order = await storeService.purchaseProduct(req.user!.userId, productId, tokensSpent, moneyPaid);
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await storeService.getOrderHistory(req.user!.userId);
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders/:orderId/coupon', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId = req.user!.userId;

    // Get order details with backward compatibility for money_paid
    let order: any;
    try {
      const orderResult = await pool.query(
        `SELECT o.id, o.coins_spent, o.money_paid, o.created_at, o.user_id,
                p.name as product_name, p.description as product_description,
                p.real_price, p.price,
                u.full_name
         FROM orders o
         JOIN products p ON o.product_id = p.id
         JOIN users u ON o.user_id = u.id
         WHERE o.id = $1 AND o.user_id = $2`,
        [orderId, userId]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      order = orderResult.rows[0];
    } catch (error: any) {
      // If money_paid column doesn't exist, fallback
      if (error.code === '42703') {
        const orderResult = await pool.query(
          `SELECT o.id, o.coins_spent, o.created_at, o.user_id,
                  p.name as product_name, p.description as product_description,
                  p.real_price, p.price,
                  u.full_name
           FROM orders o
           JOIN products p ON o.product_id = p.id
           JOIN users u ON o.user_id = u.id
           WHERE o.id = $1 AND o.user_id = $2`,
          [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }
        order = orderResult.rows[0];
        order.money_paid = null;
      } else {
        throw error;
      }
    }

    const productPrice = parseFloat(order.real_price || order.price);
    const coinsSpent = parseInt(order.coins_spent);
    const moneyPaid = order.money_paid !== null && order.money_paid !== undefined
      ? parseFloat(order.money_paid)
      : (productPrice - coinsSpent);
    const remainingPrice = productPrice - coinsSpent;

    const couponData = {
      orderId: order.id,
      productName: order.product_name,
      productDescription: order.product_description,
      tokensSpent: coinsSpent,
      productPrice: productPrice,
      remainingPrice: remainingPrice,
      moneyPaid: moneyPaid,
      customerName: order.full_name,
      purchaseDate: new Date(order.created_at),
    };

    const pdfBuffer = await pdfService.generateCoupon(couponData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cupon-${orderId}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
