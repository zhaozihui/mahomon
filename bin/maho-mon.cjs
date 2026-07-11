#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const serverDir = path.join(packageRoot, 'server');

console.log('Starting Maho-Mon...');
console.log('');
console.log('Frontend: http://localhost:5173');
console.log('Kindle:   http://localhost:5173/k.html');
console.log('Backend:  http://localhost:3001');
console.log('');

// Start backend server
const server = spawn('npx', ['tsx', path.join(serverDir, 'index.ts')], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

// Wait for server to start
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