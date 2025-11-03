import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { storeService } from '../services/storeService';
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
  productId: z.number()
});

router.post('/purchase', async (req, res) => {
  try {
    const { productId } = purchaseSchema.parse(req.body);
    const order = await storeService.purchaseProduct(req.user!.userId, productId);
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

export default router;
