// Pet API routes

import { Router } from 'express';
import { loadPetState, savePetState } from '../lib/petStorage.js';
import { Pet } from '../lib/pet.js';
import { ActionType } from '../types/pet.js';

const router = Router();

// GET /api/pet - 获取宠物状态
router.get('/', (req, res) => {
  try {
    const state = loadPetState();
    res.json(state);
  } catch (error) {
    console.error('Failed to get pet state:', error);
    res.status(500).json({ error: 'Failed to get pet state' });
  }
});

// POST /api/pet - 更新宠物状态
router.post('/', (req, res) => {
  try {
    const state = req.body;
    const success = savePetState(state);
    res.json({ success });
  } catch (error) {
    console.error('Failed to save pet state:', error);
    res.status(500).json({ error: 'Failed to save pet state' });
  }
});

// POST /api/pet/interact - 执行互动
router.post('/interact', (req, res) => {
  try {
    const { action } = req.body;
    const state = loadPetState();
    const pet = Pet.fromObject(state);
    const result = pet.interact(action as ActionType);
    savePetState(pet.toObject());
    res.json(result);
  } catch (error) {
    console.error('Failed to interact:', error);
    res.status(500).json({ error: 'Failed to interact' });
  }
});

// POST /api/pet/update - 根据使用数据更新宠物
router.post('/update', (req, res) => {
  try {
    const { totalTokens, sessionInput, sessionOutput } = req.body;
    const state = loadPetState();
    const pet = Pet.fromObject(state);
    const impact = pet.updateFromUsage(totalTokens, sessionInput, sessionOutput);
    savePetState(pet.toObject());
    res.json({ impact, state: pet.toObject() });
  } catch (error) {
    console.error('Failed to update pet:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
});

export default router;