// POST /api/signup -> creates a trial account in Supabase "accounts"
// Env vars (Vercel): SUPABASE_URL, SUPABASE_SERVICE_KEY
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v, n) => String(v || '').trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } } b = b || {};
  if (b.company) return res.status(200).json({ ok: true }); // honeypot

  const email = clip(b.email, 254).toLowerCase(), name = clip(b.name, 100);
  if (!name || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid name or email' });
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'Server not configured' });

  const trial_ends_at = new Date(Date.now() + 14 * 864e5).toISOString();
  const row = {
    name, email, business: clip(b.business, 150), country: clip(b.country, 20),
    problems: Array.isArray(b.problems) ? b.problems.slice(0, 12).map(x => clip(x, 20)) : [],
    plan: clip(b.plan, 40), trial_ends_at,
  };
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/accounts`, {
      method: 'POST',
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(row),
    });
    if (r.status === 409) return res.status(409).json({ error: 'exists' });
    if (!r.ok) return res.status(502).json({ error: 'Storage failed' });
    const [acc] = await r.json();
    return res.status(200).json({ ok: true, id: acc.id, trial_ends_at });
  } catch { return res.status(502).json({ error: 'Storage failed' }); }
}
