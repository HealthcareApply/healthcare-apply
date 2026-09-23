import { NextResponse } from 'next/server';
import { deploymentChecks } from '@/lib/deployment';
export const dynamic='force-dynamic';
export async function GET(req:Request){
  const auth=req.headers.get('authorization');
  const secret=process.env.CRON_SECRET;
  if(!secret || auth!==`Bearer ${secret}`) return NextResponse.json({error:'Unauthorized'},{status:401});
  const checks=deploymentChecks();
  return NextResponse.json({ready:checks.filter(c=>c.required).every(c=>c.ok),checks},{headers:{'Cache-Control':'no-store'}});
}
