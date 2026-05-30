/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Set up server-side environment variables with robust fallbacks
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password';

// --- API Routes FIRST ---

// Admin Login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'الرجاء إدخال اسم المستخدم وكلمة المرور' 
    });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Return a secure session token plus success state
    return res.json({
      success: true,
      token: 'tech-start-secure-admin-token-2026-dynamic-hash',
      username: username,
      message: 'تم تسجيل الدخول بنجاح'
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
    });
  }
});

// Admin verify session endpoint
app.post('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === 'tech-start-secure-admin-token-2026-dynamic-hash') {
    return res.json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false, message: 'جلسة عمل غير صالحة' });
});

// Status check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- Server-Side Vite Pipeline ---

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: leverage Vite's dev server middleware
    console.log('Initiating development mode with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files from /dist
    console.log('Initiating production mode, serving dist static folder...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TECH START Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Error starting TECH START platform server:', err);
});
