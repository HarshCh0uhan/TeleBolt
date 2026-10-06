const SITE = 'https://bsnl.co.in';
const RECHARGE_PAGE = `${SITE}/en/mobile/recharge`;
const PLANS_URL = `${SITE}/api/bsnl-proxy/api/recharge-plansnew`;

const BROWSER_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  accept: '*/*',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  origin: SITE,
  referer: RECHARGE_PAGE,
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
};

// Session cache. Vercel functions can persist memory between invocations in
// the same container, so this avoids minting a fresh cookie on every circle.
let cachedSession = null;
let cachedAt = 0;
const SESSION_TTL_MS = 5 * 60 * 1000;

const extractSession = (setCookieHeader) => {
  if (!setCookieHeader) return null;
  const list = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  return list.map((s) => s.split(';')[0]).find((s) => s.startsWith('bsnl_session=')) || null;
};

const mintSession = async () => {
  const res = await fetch(RECHARGE_PAGE, {
    headers: { 'user-agent': BROWSER_HEADERS['user-agent'], accept: 'text/html' },
  });
  const setCookie = res.headers.getSetCookie?.() || res.headers.get('set-cookie');
  const cookie = extractSession(setCookie);
  if (!cookie) throw new Error(`BSNL did not issue a session (HTTP ${res.status})`);
  return cookie;
};

const ensureSession = async () => {
  const now = Date.now();
  if (cachedSession && now - cachedAt < SESSION_TTL_MS) return cachedSession;
  cachedSession = await mintSession();
  cachedAt = now;
  return cachedSession;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { enc } = req.body || {};
  if (!enc || typeof enc !== 'string') {
    return res.status(400).json({ error: 'Missing enc payload' });
  }

  try {
    let cookie = await ensureSession();

    let response = await fetch(PLANS_URL, {
      method: 'POST',
      headers: { ...BROWSER_HEADERS, cookie },
      body: JSON.stringify({ enc }),
    });

    // A stale session is worth one retry with a fresh cookie.
    if (response.status === 401 || response.status === 403) {
      cachedSession = null;
      cookie = await ensureSession();
      response = await fetch(PLANS_URL, {
        method: 'POST',
        headers: { ...BROWSER_HEADERS, cookie },
        body: JSON.stringify({ enc }),
      });
    }

    const body = await response.text();
    res.status(response.status).send(body);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}