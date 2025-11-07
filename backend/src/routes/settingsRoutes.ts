import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { settingsService } from '../services/settingsService';
import { z } from 'zod';

const router = Router();

// Public endpoint for getting specific public settings (like terms and conditions)
router.get('/public/:key', async (req, res) => {
  try {
    const { key } = req.params;
    // Only allow specific public settings
    const allowedPublicSettings = ['terms_and_conditions'];

    if (!allowedPublicSettings.includes(key)) {
      return res.status(403).json({ error: 'This setting is not publicly accessible' });
    }

    const value = await settingsService.getSetting(key);
    res.json({ key, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.use(authenticate);
router.use(requireAdmin);

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await settingsService.getAllSettings();
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a setting
const updateSettingSchema = z.object({
  value: z.string(),
});

router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = updateSettingSchema.parse(req.body);

    const updatedSetting = await settingsService.updateSetting(key, value);
    res.json({ setting: updatedSetting });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
