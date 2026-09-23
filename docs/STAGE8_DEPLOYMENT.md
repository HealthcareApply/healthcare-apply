# Healthcare Apply 2.0 — Stage 8 Deployment & Live Beta

## Deployment order
1. Create a Supabase project. Run migrations `001_initial.sql` through `007_beta_launch.sql` in numeric order. Confirm the private resume bucket and RLS policies before adding users.
2. Configure Supabase Auth: production Site URL, allowed redirect URLs, email confirmation, reset-password redirect, and an SMTP provider suitable for beta email delivery.
3. Create the OpenAI API key and set it only as a server environment variable. Do not expose it with a `NEXT_PUBLIC_` prefix.
4. Configure Serper if recruiter/hiring-manager public-web research will be enabled in beta.
5. Create Stripe products/prices for Pro and Premium. Add the production webhook endpoint `/api/billing/webhook`, subscribe to the events expected by the route, then set the webhook signing secret and price IDs.
6. Verify a sending domain with Resend and replace the example `EMAIL_FROM` value.
7. Deploy to Vercel. Add all environment variables to Preview first, deploy, run smoke tests, then promote the same tested commit/configuration to Production.
8. Set a long random `CRON_SECRET`. Confirm both Vercel cron routes reject requests without it and succeed with Vercel's configured authorization behavior.

## Preflight
Run `npm run preflight` after loading production-like environment variables. After deployment, an operator can call `GET /api/deployment/preflight` with `Authorization: Bearer <CRON_SECRET>`; it returns configuration names/status only, never secret values.

`GET /api/health` is intentionally unauthenticated and returns only service health/time. It can be used by uptime monitoring.

## Staging smoke test — required before beta
Use a disposable user and a non-production Stripe test customer.

- Sign up; verify email; sign out/in; request password reset; complete reset.
- Upload TXT, PDF and DOCX resumes; confirm another account cannot read the files or profile.
- Generate profile; edit it; explicitly verify it; confirm generated facts never become verified without user action.
- Configure job preferences; run discovery; add a manual job; inspect score/reasons/gaps.
- Generate an application package; edit/save; regenerate; confirm version history; export DOCX/PDF/TXT.
- Run contact discovery; inspect evidence/source/confidence; personalize outreach; confirm no email/LinkedIn message is auto-sent.
- Exercise CRM status changes and follow-up reminders.
- Exercise Free limits, Stripe test Checkout, webhook update, Portal, downgrade/cancel behavior and server-side entitlement enforcement.
- Trigger daily-match and follow-up cron routes manually with the cron secret; verify deduplication and email delivery.
- Export account data; permanently delete the disposable account; verify login fails and private storage/app rows are gone.
- Confirm `/admin` is denied to a normal user and available only to configured admin emails.
- Check mobile layouts on iPhone-sized and desktop viewports; inspect server logs for unhandled errors.

## Go/no-go
Do not invite beta users until all required environment checks pass, migrations/RLS are verified, the full smoke test passes, Stripe webhook signatures are verified, emails arrive from the verified domain, destructive deletion is confirmed with a disposable account, and there are no secrets in browser bundles or logs.

## Recommended beta rollout
Start with founder + 2–5 invited testers. Keep payments in Stripe test mode until the workflow is stable. Then enable live Stripe keys for a small invite-only cohort before public signup.
