import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password';
const ADMIN_TOKEN = 'tech-start-secure-admin-token-2026-dynamic-hash';

router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: 'الرجاء إدخال اسم المستخدم وكلمة المرور'
    });
    return;
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({
      success: true,
      token: ADMIN_TOKEN,
      username,
      message: 'تم تسجيل الدخول بنجاح'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
    });
  }
});

router.post("/admin/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === ADMIN_TOKEN) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false, message: 'جلسة عمل غير صالحة' });
  }
});

export default router;
