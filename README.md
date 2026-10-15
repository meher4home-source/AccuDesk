# Ledgerline: deploy in 4 steps (all free tiers)
1. **Supabase**: new project, run `schema.sql` in SQL Editor, enable Auth > Email. Copy Project URL + anon key.
2. **app.html**: replace `SB_URL` and `SB_KEY` (anon key only, never the service key). Put payment links in `PAY`, keyed by plan name (Starter, Growth, Firm).
3. **Vercel**: import this folder (or `vercel deploy`). Env vars: `RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
4. **Razorpay**: webhook URL `https://YOURDOMAIN.com/api/webhook`, events `payment.captured`, `subscription.charged`.
Also: set WhatsApp number in `index.html` (CFG), replace YOURDOMAIN.com in robots.txt/sitemap.xml, add Terms/Privacy pages before taking payments.
Note: webhook handles Razorpay only. Other gateways need their own signature check.
