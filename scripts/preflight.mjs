const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','OPENAI_API_KEY','NEXT_PUBLIC_APP_URL','CRON_SECRET'];
const optional=['SERPER_API_KEY','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PRO_PRICE_ID','STRIPE_PREMIUM_PRICE_ID','RESEND_API_KEY','EMAIL_FROM','ADMIN_EMAILS'];
let failed=false;
for(const k of required){const ok=!!process.env[k]; console.log(`${ok?'OK':'MISSING'} required ${k}`); if(!ok) failed=true;}
for(const k of optional) console.log(`${process.env[k]?'OK':'OPTIONAL'} ${k}`);
process.exitCode=failed?1:0;
