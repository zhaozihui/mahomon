// Usage API routes

import { Router } from 'express';
import { getUsageData } from '../lib/claudeMonitor.js';

const router = Router();

// GET /api/usage - 获取使用数据
router.get('/', (req, res) => {
  try {
    const usageData = getUsageData();
    res.json(usageData);
  } catch (error) {
    console.error('Failed to get usage data:', error);
    res.status(500).json({ error: 'Failed to get usage data' });
  }
});

export default router;