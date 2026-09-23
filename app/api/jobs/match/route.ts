import {NextResponse} from 'next/server';import {scoreJob} from '@/lib/match';
export async function POST(req:Request){const {profile,job}=await req.json();return NextResponse.json(scoreJob(profile,job));}
