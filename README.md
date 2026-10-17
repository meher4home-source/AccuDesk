# Ledgerline: deploy checklist (free tiers)
1. **Supabase**: new project, run `schema.sql`, enable Auth > Email. Set `SB_URL`, `SB_KEY` (anon key only) in `app.html`.
2. **Google login**: Google Cloud Console > OAuth client (Web). Redirect URI = the callback shown in Supabase > Auth > Providers > Google. Paste Client ID/Secret there. Add your site URL under Auth > URL Configuration.
3. **Email**: Supabase built-in email is heavily rate-limited. Add free SMTP (Resend) in Auth > SMTP before launch.
4. **Vercel**: import this folder. Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `DODO_WEBHOOK_SECRET` (and `RAZORPAY_WEBHOOK_SECRET` if used).
5. **Dodo Payments**: create 3 subscription products (Starter, Growth, Firm), copy each checkout link into `PAY` in `app.html`. Webhook URL `https://YOURDOMAIN.com/api/dodo-webhook`, events `payment.succeeded`, `subscription.active`, `subscription.cancelled`. Send a test event from Dodo and confirm `profiles.status` changes.
6. Replace WhatsApp number (`index.html`), `YOURDOMAIN.com` (robots/sitemap), and the [brackets] in `terms.html`/`privacy.html`.
Security: never put the service key in HTML. Writes stop after the trial unless `status='active'` (enforced in the database).

## Vercel notes
- Import with Framework Preset **Other** (not Node). Do not pin a Node version; the project default is used.
- Push the *contents* of this folder to the repo root (index.html must be at the top level).
- Vercel Hobby is for non-commercial use. Move to Pro (or Cloudflare Pages) before you charge customers.
