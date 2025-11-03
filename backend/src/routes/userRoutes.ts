import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { userService } from '../services/userService';

const router = Router();

router.use(authenticate);

router.get('/balance', async (req, res) => {
  try {
    const balance = await userService.getBalance(req.user!.userId);
    res.json({ success: true, balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await userService.getTransactionHistory(req.user!.userId);
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const expiringCoins = await userService.getExpiringCoins(req.user!.userId, days);
    res.json({ success: true, expiringCoins });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/referrals', async (req, res) => {
  try {
    const stats = await userService.getReferralStats(req.user!.userId);
    res.json({ success: true, referrals: stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
