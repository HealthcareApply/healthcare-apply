# Healthcare Apply 2.0 — Stage 7 Private Beta

Healthcare Apply is a standalone healthcare career intelligence SaaS. Users create Healthcare Apply accounts directly; no ChatGPT login or user-supplied OpenAI API key is required.

## Stage 7 adds
- Email-verification-aware signup plus forgot/reset password flows
- Editable automated-matching, score-threshold and email-notification settings
- Self-service JSON data export and permanent account deletion
- First-party product-event table/API for beta analytics
- Restricted `/admin` beta-health dashboard controlled by `ADMIN_EMAILS`
- Beta-launch database migration (`007_beta_launch.sql`)
- Clear production environment/deployment checklist

Stages 1–6 remain included: verified AI candidate profiles, PDF/DOCX/TXT resume parsing, Greenhouse/Lever source adapters, manual job ingestion, weighted 0–100 matching, Application Studio, version history, Career CRM, public-source contact intelligence, DOCX/PDF exports, Stripe entitlements/usage metering, Resend notifications, protected daily matching/follow-up cron routes.

## Required production setup
1. Create a Supabase project and apply migrations `001` through `007` in order.
2. Keep the `resumes` bucket private and confirm its storage policies from the onboarding migration.
3. Enable email confirmation in Supabase Auth and configure the production Site URL / redirect URLs.
4. Configure OpenAI, Stripe, Resend and optional Serper credentials in Vercel/server environment variables.
5. Set `ADMIN_EMAILS` to comma-separated trusted admin email addresses only.
6. Configure Stripe webhook delivery to `/api/billing/webhook` and use the signing secret.
7. Set a strong `CRON_SECRET`; Vercel cron routes must not be publicly invokable without it.
8. Verify your sending domain with Resend and set the production From address.
9. Run `npm install`, `npm run typecheck`, and `npm run build` in the deployment environment before promoting a release.
10. Exercise signup/verification, password reset, resume upload, profile approval, matching, generation, contact research, exports, billing, webhooks, cron jobs, data export and deletion against a staging project before inviting beta users.

## Important beta limitations
- Greenhouse/Lever are adapters, not universal web crawling. Broader employer/ATS coverage still requires additional approved sources/providers.
- Public-web contact research returns evidence-based leads, not guaranteed requisition owners or verified private email addresses.
- The in-memory rate-limit helper included in this codebase is suitable only as a local guard/example. Before public launch, use a shared durable rate limiter (for example Redis/KV) at high-cost endpoints and authentication boundaries.
- Application submission and recruiter outreach remain user-controlled; Healthcare Apply does not automatically submit or send on the user's behalf.
- Legal/privacy copy should be reviewed by qualified counsel before a public launch, especially before collecting payment or expanding into additional jurisdictions.

## Private beta exit criteria
A beta release should not be considered launch-ready until the production dependency install/build passes, migrations and RLS are verified on staging, Stripe webhook events are tested, cron authentication is tested, email deliverability is confirmed, destructive account deletion is tested with disposable accounts, and the end-to-end user journey is completed on mobile and desktop.

## Stage 8 — Deployment & Live Beta readiness
Stage 8 adds `/api/health`, a protected `/api/deployment/preflight` configuration check, `npm run preflight`, `npm run verify`, a cleaned production environment template, and a full staging smoke-test/go-live runbook in `docs/STAGE8_DEPLOYMENT.md`.

This source package is deployment-ready, but external services are **not** connected merely by possessing this ZIP. Supabase, OpenAI, Stripe, Resend, Serper and Vercel must be configured with the account owner's credentials. The build environment used to assemble this stage could not finish `npm install` within its execution window, so `npm run verify` must pass in staging before launch.
