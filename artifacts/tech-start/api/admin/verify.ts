import crypto from "node:crypto";

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

function expectedToken(): string {
  return crypto
    .createHmac("sha256", ADMIN_PASS || "")
    .update(ADMIN_USER || "")
    .digest("hex");
}

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers?.authorization as string | undefined;
  const token = authHeader?.split(" ")[1];

  if (!ADMIN_USER || !ADMIN_PASS) {
    return res.status(503).json({ authenticated: false });
  }

  if (token && token === expectedToken()) {
    return res.json({ authenticated: true });
  }

  return res.status(401).json({
    authenticated: false,
    message: "جلسة عمل غير صالحة",
  });
}
