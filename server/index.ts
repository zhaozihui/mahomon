// Express server for Claude Monitor Web

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
import usageRouter from './routes/usage.js';
import petRouter from './routes/pet.js';
import systemRouter from './routes/system.js';

app.use('/api/usage', usageRouter);
app.use('/api/pet', petRouter);
app.use('/api/system', systemRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Claude Monitor API running at http://localhost:${PORT}`);
});