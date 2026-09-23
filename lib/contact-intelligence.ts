import {getOpenAI,MODEL} from '@/lib/openai';
export type ContactLead={name:string;title:string;email:string|null;linkedinUrl:string|null;sourceUrl:string;contactType:'recruiter'|'hiring_manager'|'talent_leader'|'unknown';confidence:number;evidence:string;discoveryMethod:string};
type SearchItem={title?:string;link?:string;snippet?:string};
export async function discoverContacts(company:string,jobTitle:string):Promise<ContactLead[]>{
 const key=process.env.SERPER_API_KEY;
 if(!key)throw new Error('Contact discovery requires SERPER_API_KEY. Add it server-side to enable public-web contact research.');
 const queries=[`site:linkedin.com/in ${company} recruiter ${jobTitle}`,`site:linkedin.com/in ${company} "talent acquisition"`,`${company} ${jobTitle} hiring manager recruiter`];
 const rows:SearchItem[]=[];
 for(const q of queries){const r=await fetch('https://google.serper.dev/search',{method:'POST',headers:{'content-type':'application/json','X-API-KEY':key},body:JSON.stringify({q,num:8})});if(!r.ok)continue;const d=await r.json();rows.push(...(d.organic||[]));}
 const unique=[...new Map(rows.filter(x=>x.link).map(x=>[x.link,x])).values()].slice(0,20);
 if(!unique.length)return [];
 const ai=getOpenAI();
 const prompt=`Identify only plausible professional recruiting/hiring contacts for COMPANY and JOB from the supplied PUBLIC_SEARCH_RESULTS. Do not invent names, emails, URLs, employers or titles. An email may be returned only if literally present in a search result. A LinkedIn URL may be returned only if literally present. Confidence reflects evidence: 90+ direct role/company fit; 70-89 strong talent/recruiting fit; 50-69 plausible but indirect. Return at most 5.\nCOMPANY=${company}\nJOB=${jobTitle}\nPUBLIC_SEARCH_RESULTS=${JSON.stringify(unique)}`;
 const r=await ai.responses.create({model:MODEL,input:prompt,text:{format:{type:'json_schema',name:'contact_leads',strict:true,schema:{type:'object',additionalProperties:false,properties:{contacts:{type:'array',maxItems:5,items:{type:'object',additionalProperties:false,properties:{name:{type:'string'},title:{type:'string'},email:{type:['string','null']},linkedinUrl:{type:['string','null']},sourceUrl:{type:'string'},contactType:{type:'string',enum:['recruiter','hiring_manager','talent_leader','unknown']},confidence:{type:'integer',minimum:0,maximum:100},evidence:{type:'string'}},required:['name','title','email','linkedinUrl','sourceUrl','contactType','confidence','evidence']}}},required:['contacts']}}}});
 const parsed=JSON.parse(r.output_text) as {contacts:Omit<ContactLead,'discoveryMethod'>[]};
 const allowed=new Set(unique.map(x=>x.link));
 return parsed.contacts.filter(c=>allowed.has(c.sourceUrl)).map(c=>({...c,discoveryMethod:'public_web_search'}));
}
