import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { adminService } from '../services/adminService';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['user', 'admin']).optional()
});

router.post('/users', async (req, res) => {
  try {
    const { email, password, fullName, role } = createUserSchema.parse(req.body);
    const user = await adminService.createUser(email, password, fullName, role);
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const awardCoinsSchema = z.object({
  userId: z.number(),
  amount: z.number().positive(),
  description: z.string(),
  expiryDays: z.number().optional(),
  observations: z.string().optional()
});

router.post('/award', async (req, res) => {
  try {
    const { userId, amount, description, expiryDays, observations } = awardCoinsSchema.parse(req.body);
    const transaction = await adminService.awardCoins(userId, amount, description, expiryDays, observations);
    res.json({ success: true, transaction });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const users = await adminService.getAllUsers(limit, offset);
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const users = await adminService.searchUsers(query);
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const tokenOfferSchema = z.object({
  tokens: z.number().min(0),
  money: z.number().min(0),
  summary: z.string()
});

const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  real_price: z.number().positive().optional(),
  max_tokens: z.number().positive().optional(),
  type: z.enum(['standard', 'promotion', 'free']),
  token_offers: z.array(tokenOfferSchema).optional(),
  image_url: z.string().optional()
});

router.post('/products', async (req, res) => {
  try {
    const { name, description, price, real_price, max_tokens, type, token_offers, image_url } = productSchema.parse(req.body);
    const product = await adminService.createProduct(name, description, price, type, real_price, max_tokens, token_offers, image_url);
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await adminService.updateProduct(productId, req.body);
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await adminService.getAllProducts();
    res.json({ success: true, products });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await adminService.deleteProduct(productId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;
    const type = req.query.type as string | undefined;
    const dateFrom = req.query.date_from as string | undefined;
    const dateTo = req.query.date_to as string | undefined;
    const amountMin = req.query.amount_min ? parseInt(req.query.amount_min as string) : undefined;
    const amountMax = req.query.amount_max ? parseInt(req.query.amount_max as string) : undefined;

    const transactions = await adminService.getAllTransactions(limit, offset, {
      userId, type, dateFrom, dateTo, amountMin, amountMax
    });
    res.json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Refund transaction
router.post('/transactions/:id/refund', async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { reason } = req.body;
    const refundTransaction = await adminService.refundTransaction(transactionId, reason);
    res.json({ success: true, refund: refundTransaction });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const orders = await adminService.getAllOrders(limit, offset);
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userDetails = await adminService.getUserDetails(userId);
    res.json({ success: true, ...userDetails });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const analytics = await adminService.getAnalytics();
    res.json({ success: true, analytics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Rewards endpoints
const rewardSchema = z.object({
  amount: z.number().positive(),
  eventTitle: z.string().min(1),
  defaultExpiryDays: z.number().positive().optional()
});

router.post('/rewards', async (req, res) => {
  try {
    const { amount, eventTitle, defaultExpiryDays } = rewardSchema.parse(req.body);
    const reward = await adminService.createReward(amount, eventTitle, defaultExpiryDays);
    res.status(201).json({ success: true, reward });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/rewards', async (req, res) => {
  try {
    const rewards = await adminService.getAllRewards();
    res.json({ success: true, rewards });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rewards/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const rewards = await adminService.searchRewards(query || '');
    res.json({ success: true, rewards });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/rewards/:id', async (req, res) => {
  try {
    const rewardId = parseInt(req.params.id);
    const reward = await adminService.updateReward(rewardId, req.body);
    res.json({ success: true, reward });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/rewards/:id', async (req, res) => {
  try {
    const rewardId = parseInt(req.params.id);
    await adminService.deleteReward(rewardId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
