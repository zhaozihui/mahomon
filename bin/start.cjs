#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageRoot = path.resolve(__dirname, '..');
const serverDir = path.join(packageRoot, 'server');

// Start backend server
const server = spawn('npx', ['tsx', path.join(serverDir, 'index.ts')], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

// Wait a bit for server to start
setTimeout(() => {
  // Start frontend
  const frontend = spawn('npx', ['vite', '--host'], {
    cwd: packageRoot,
    stdio: 'inherit',
    shell: true
  });

  frontend.on('close', (code) => {
    server.kill();
    process.exit(code || 0);
  });
}, 2000);

server.on('close', (code) => {
  process.exit(code || 0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});