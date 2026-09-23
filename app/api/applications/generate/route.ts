import {NextResponse} from 'next/server';
import {getEntitlement,recordUsage} from '@/lib/entitlements';
import {createClient} from '@/lib/supabase/server';
import {getOpenAI,MODEL} from '@/lib/openai';
import {z} from 'zod';

const Body=z.object({jobId:z.string().uuid()});
const Output=z.object({atsResume:z.string(),coverLetter:z.string(),recruiterEmail:z.string(),linkedInMessage:z.string(),generationNotes:z.array(z.string()).default([])});

export async function POST(req:Request){
 try{
  const {jobId}=Body.parse(await req.json());
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});const entitlement=await getEntitlement(user.id,'application_generation');if(!entitlement.allowed)return NextResponse.json({error:`Monthly limit reached for ${'}entitlement.plan{'} plan`,entitlement},{status:402});
  const [{data:profile},{data:job}]=await Promise.all([
   supabase.from('profiles').select('*').eq('id',user.id).eq('profile_verified',true).single(),
   supabase.from('jobs').select('*').eq('id',jobId).single()
  ]);
  if(!profile)return NextResponse.json({error:'Verify your candidate profile before generating application materials.'},{status:400});
  if(!job)return NextResponse.json({error:'Job not found.'},{status:404});
  const ai=getOpenAI();
  const prompt=`You are Healthcare Apply's application engine. Create a truthful, highly tailored application package using ONLY facts explicitly present in VERIFIED_PROFILE. Never add, infer, embellish, or fabricate employers, titles, dates, metrics, degrees, certifications, skills, tools, responsibilities, or accomplishments. You may rephrase and prioritize verified facts to align with JOB. If JOB requests something absent from the profile, do not claim it; note the omission in generationNotes.\n\nReturn strict JSON with keys atsResume, coverLetter, recruiterEmail, linkedInMessage, generationNotes. The ATS resume must be plain-text, ATS-friendly, concise, keyword-aware, and preserve factual integrity. The cover letter should be specific to the employer/job. Recruiter email should be concise and professional. LinkedIn message should be under 500 characters.\n\nVERIFIED_PROFILE=${JSON.stringify(profile)}\nJOB=${JSON.stringify(job)}`;
  const r=await ai.responses.create({model:MODEL,input:prompt,text:{format:{type:'json_schema',name:'application_package',strict:true,schema:{type:'object',additionalProperties:false,properties:{atsResume:{type:'string'},coverLetter:{type:'string'},recruiterEmail:{type:'string'},linkedInMessage:{type:'string'},generationNotes:{type:'array',items:{type:'string'}}},required:['atsResume','coverLetter','recruiterEmail','linkedInMessage','generationNotes']}}}});
  const generated=Output.parse(JSON.parse(r.output_text));
  const {data:existing}=await supabase.from('applications').select('id,current_version').eq('user_id',user.id).eq('job_id',jobId).maybeSingle();
  let applicationId=existing?.id as string|undefined; let version=(existing?.current_version||0)+1;
  if(!applicationId){const {data:created,error}=await supabase.from('applications').insert({user_id:user.id,job_id:jobId,status:'interested',current_version:1,...{tailored_resume:generated.atsResume,cover_letter:generated.coverLetter,recruiter_email:generated.recruiterEmail,linkedin_message:generated.linkedInMessage}}).select('id').single();if(error)throw error;applicationId=created.id;version=1;}
  else {const {error}=await supabase.from('applications').update({current_version:version,tailored_resume:generated.atsResume,cover_letter:generated.coverLetter,recruiter_email:generated.recruiterEmail,linkedin_message:generated.linkedInMessage,updated_at:new Date().toISOString()}).eq('id',applicationId).eq('user_id',user.id);if(error)throw error;}
  const {error:ve}=await supabase.from('application_versions').insert({application_id:applicationId,user_id:user.id,version,tailored_resume:generated.atsResume,cover_letter:generated.coverLetter,recruiter_email:generated.recruiterEmail,linkedin_message:generated.linkedInMessage,generation_notes:generated.generationNotes});if(ve)throw ve;
  await supabase.from('application_events').insert({application_id:applicationId,user_id:user.id,event_type:'generated',detail:`Generated application package v${version}`});
  await recordUsage(user.id,'application_generation',{jobId,applicationId});return NextResponse.json({applicationId,version});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Generation failed'},{status:500});}
}
