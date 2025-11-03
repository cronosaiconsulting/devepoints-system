import { Router } from 'express';
import { userService } from '../services/userService';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  referralCode: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, referralCode } = registerSchema.parse(req.body);
    const user = await userService.register(email, password, fullName, referralCode);
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await userService.login(email, password);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
