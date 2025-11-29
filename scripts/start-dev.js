#!/usr/bin/env node

// Workaround script to bypass Node version check for Next.js
const { spawn } = require('child_process');
const path = require('path');

// Patch process.version temporarily
const originalVersion = process.version;
Object.defineProperty(process, 'version', {
  get: () => 'v18.18.0',
  configurable: true
});

// Start Next.js dev server
const nextBin = path.join(__dirname, '../node_modules/.bin/next');
const child = spawn('node', [nextBin, 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--no-warnings'
  }
});

child.on('exit', (code) => {
  process.exit(code);
});

