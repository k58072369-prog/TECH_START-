import { Router } from "express";
import { randomBytes } from "crypto";
import { logger } from "../lib/logger";

const router = Router();

// Fail closed: if credentials are not configured via env vars, no login is possible.
const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

if (!ADMIN_USER || !ADMIN_PASS) {
  logger.warn(
    "ADMIN_USERNAME and/or ADMIN_PASSWORD are not set. " +
    "Admin login will be rejected until both are configured as environment variables."
  );
}

// Generate a random, unguessable session token at startup — never a static string.
const SESSION_TOKEN = randomBytes(48).toString("hex");

router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: "الرجاء إدخال اسم المستخدم وكلمة المرور"
    });
    return;
  }

  // Fail closed when credentials are not configured
  if (!ADMIN_USER || !ADMIN_PASS) {
    res.status(503).json({
      success: false,
      message: "لوحة التحكم غير مهيأة. يرجى ضبط متغيرات البيئة المطلوبة."
    });
    return;
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({
      success: true,
      token: SESSION_TOKEN,
      username,
      message: "تم تسجيل الدخول بنجاح"
    });
  } else {
    res.status(401).json({
      success: false,
      message: "اسم المستخدم أو كلمة المرور غير صحيحة"
    });
  }
});

router.post("/admin/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token && token === SESSION_TOKEN) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false, message: "جلسة عمل غير صالحة" });
  }
});

export default router;
