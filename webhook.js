// POST /api/webhook  (Razorpay). Set the same URL + secret in Razorpay > Webhooks.
// Events: payment.captured, subscription.charged -> profiles.status = 'active'
// Env: RAZORPAY_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
// Note: Dodo/Lemon Squeezy use different signature headers; adapt verify() accordingly.
import crypto from 'node:crypto';
export const config = { api: { bodyParser: false } };

const raw = req => new Promise((ok, no) => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => ok(Buffer.concat(c))); req.on('error', no); });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = await raw(req);
  const sig = String(req.headers['x-razorpay-signature'] || '');
  const mac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(body).digest('hex');
  const a = Buffer.from(sig), b = Buffer.from(mac);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'bad signature' });

  const ev = JSON.parse(body.toString('utf8'));
  if (!['payment.captured', 'subscription.charged'].includes(ev.event)) return res.status(200).json({ ok: true });
  const ent = ev.payload?.payment?.entity || {};
  const email = String(ent.email || ent.notes?.email || '').toLowerCase();
  if (!email) return res.status(200).json({ ok: true, skipped: 'no email' });

  const { SUPABASE_URL: U, SUPABASE_SERVICE_KEY: K } = process.env;
  const r = await fetch(`${U}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'active' }),
  });
  return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
}
