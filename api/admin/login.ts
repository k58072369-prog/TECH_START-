/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { username, password } = req.body || {};

  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password';

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'الرجاء إدخال اسم المستخدم وكلمة المرور' 
    });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.status(200).json({
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
}
