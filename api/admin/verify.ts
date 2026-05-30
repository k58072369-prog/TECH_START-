/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === 'tech-start-secure-admin-token-2026-dynamic-hash') {
    return res.status(200).json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false, message: 'جلسة عمل غير صالحة' });
}
