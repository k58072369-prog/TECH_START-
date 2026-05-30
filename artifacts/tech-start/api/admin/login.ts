import crypto from "node:crypto";

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

function makeToken(): string {
  return crypto
    .createHmac("sha256", ADMIN_PASS || "")
    .update(ADMIN_USER || "")
    .digest("hex");
}

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};

  if (!ADMIN_USER || !ADMIN_PASS) {
    return res.status(503).json({
      success: false,
      message: "لوحة التحكم غير مهيأة. يرجى ضبط متغيرات البيئة.",
    });
  }

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "الرجاء إدخال اسم المستخدم وكلمة المرور",
    });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({
      success: true,
      token: makeToken(),
      username,
      message: "تم تسجيل الدخول بنجاح",
    });
  }

  return res.status(401).json({
    success: false,
    message: "اسم المستخدم أو كلمة المرور غير صحيحة",
  });
}
