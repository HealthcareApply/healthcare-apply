import {CandidateProfile,Job,JobMatch,MatchBreakdown} from '@/types/domain';
export const MATCH_WEIGHTS={qualifications:.30,experience:.20,responsibilities:.15,industry:.10,seniority:.10,skills:.10,location:.05} as const;
const STOP=new Set(['and','the','with','for','from','that','this','your','you','our','are','will','have','has','into','job','role','work','team']);
const tokens=(s:string)=>new Set((s.toLowerCase().match(/[a-z0-9+#.-]{3,}/g)||[]).filter(x=>!STOP.has(x)));
const overlap=(items:string[],text:string)=>{if(!items.length)return 60;const T=tokens(text);let hit=0;for(const item of items){const W=[...tokens(item)];if(W.length&&W.some(w=>T.has(w)))hit++}return Math.round(100*hit/items.length)};
const yearsRequired=(text:string)=>{const m=text.match(/(\d{1,2})\+?\s*(?:to\s*\d{1,2}\s*)?years?(?:\s+of)?\s+(?:relevant\s+)?experience/i);return m?Number(m[1]):0};
const level=(s:string)=>/\b(vp|vice president|chief|head)\b/i.test(s)?5:/\b(director)\b/i.test(s)?4:/\b(senior manager|sr\.? manager|associate director)\b/i.test(s)?3:/\b(manager|lead)\b/i.test(s)?2:1;
export function scoreJob(p:CandidateProfile,j:Job):JobMatch{
 const text=`${j.title} ${j.location} ${j.description}`;const req=yearsRequired(j.description);
 const experience=req?Math.max(0,Math.min(100,Math.round(100*p.yearsExperience/req))):Math.min(100,65+p.yearsExperience*2);
 const targetLevel=Math.max(1,...p.targetTitles.map(level));const jobLevel=level(j.title);const seniority=Math.max(25,100-Math.abs(targetLevel-jobLevel)*25);
 const pref=p.preferredLocations.map(x=>x.toLowerCase());const loc=(j.location||'').toLowerCase();let location=70;if(p.remotePreference==='remote')location=/remote/i.test(text)?100:30;else if(p.remotePreference==='hybrid')location=/hybrid/i.test(text)?100:60;else if(p.remotePreference==='onsite')location=/remote/i.test(text)?45:85;if(pref.length&&pref.some(x=>loc.includes(x)||x.includes(loc)))location=100;
 const b:MatchBreakdown={qualifications:overlap([...p.education,...p.certifications,...p.skills.slice(0,8)],text),experience,responsibilities:overlap(p.achievements,text),industry:overlap(p.industries,text),seniority,skills:overlap(p.skills,text),location};
 const score=Math.round(Object.entries(MATCH_WEIGHTS).reduce((n,[k,w])=>n+b[k as keyof MatchBreakdown]*w,0));const labels:Record<keyof MatchBreakdown,string>={qualifications:'qualifications',experience:'experience',responsibilities:'responsibilities',industry:'industry',seniority:'seniority',skills:'skills',location:'location'};
 const ranked=(Object.entries(b) as [keyof MatchBreakdown,number][]).sort((a,b)=>b[1]-a[1]);return {score,breakdown:b,reasons:ranked.slice(0,3).map(([k,v])=>`${v}% ${labels[k]} alignment`),gaps:ranked.filter(([,v])=>v<55).map(([k])=>labels[k])};
}
