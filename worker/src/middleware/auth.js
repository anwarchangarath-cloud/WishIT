// Verifies Firebase ID tokens using Google's JWK endpoint
async function getFirebasePublicKeys() {
  const res = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    { cf: { cacheTtl: 3600 } }
  );
  return res.json();
}

function base64urlDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function verifyFirebaseToken(token, projectId) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const header = JSON.parse(new TextDecoder().decode(base64urlDecode(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(parts[1])));

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error('Token expired');
  if (payload.aud !== projectId) throw new Error('Invalid audience');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Invalid issuer');
  if (!payload.sub) throw new Error('Missing subject');

  const { keys } = await getFirebasePublicKeys();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('Unknown key ID');

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(`${parts[0]}.${parts[1]}`);
  const signature = base64urlDecode(parts[2]);

  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, data);
  if (!valid) throw new Error('Invalid signature');

  return payload;
}

export function authMiddleware() {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const token = authHeader.slice(7);
      const payload = await verifyFirebaseToken(token, c.env.FIREBASE_PROJECT_ID);

      // Load user from D1
      const user = await c.env.DB.prepare('SELECT * FROM users WHERE uid = ?')
        .bind(payload.sub)
        .first();

      if (!user) return c.json({ error: 'User not registered' }, 401);

      c.set('user', user);
      await next();
    } catch {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  };
}

export function requireRole(...roles) {
  return async (c, next) => {
    const user = c.get('user');
    if (!roles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    await next();
  };
}
