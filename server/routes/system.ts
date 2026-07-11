// System API routes - CPU, Memory, Network monitoring

import { Router } from 'express';
import si from 'systeminformation';

const router = Router();

// GET /api/system - Get system monitoring data
router.get('/', async (req, res) => {
  try {
    const [cpu, mem, net] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
    ]);

    res.json({
      cpu: cpu.currentLoad,
      memory: (mem.used / mem.total) * 100,
      networkUp: net[0]?.tx_sec || 0,
      networkDown: net[0]?.rx_sec || 0,
    });
  } catch (error) {
    console.error('Failed to get system data:', error);
    res.status(500).json({ error: 'Failed to get system data' });
  }
});

export default router;