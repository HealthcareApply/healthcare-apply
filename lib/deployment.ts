export type Check = { name:string; ok:boolean; required:boolean; detail:string };

const has=(name:string)=>Boolean(process.env[name]?.trim());
export function deploymentChecks(): Check[] {
  const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','OPENAI_API_KEY','NEXT_PUBLIC_APP_URL','CRON_SECRET'];
  const optional=['SERPER_API_KEY','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PRO_PRICE_ID','STRIPE_PREMIUM_PRICE_ID','RESEND_API_KEY','EMAIL_FROM','ADMIN_EMAILS'];
  return [
    ...required.map(name=>({name,ok:has(name),required:true,detail:has(name)?'configured':'missing'})),
    ...optional.map(name=>({name,ok:has(name),required:false,detail:has(name)?'configured':'not configured; related feature will be unavailable'})),
  ];
}
