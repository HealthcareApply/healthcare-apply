import type {Job} from '@/types/domain';
const strip=(s:string)=>s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
export type SourceConfig={id?:string;provider:'greenhouse'|'lever';slug:string;company:string};
export async function fetchSource(c:SourceConfig):Promise<(Job&{externalId:string})[]>{
 if(c.provider==='greenhouse'){
  const r=await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(c.slug)}/jobs?content=true`,{next:{revalidate:1800}}); if(!r.ok)throw new Error(`Greenhouse ${c.slug}: ${r.status}`); const d=await r.json();
  return (d.jobs||[]).map((j:any)=>({source:'greenhouse',externalId:String(j.id),sourceUrl:j.absolute_url,company:c.company,title:j.title,location:j.location?.name||'',description:strip(j.content||''),postedAt:j.updated_at}));
 }
 const r=await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(c.slug)}?mode=json`,{next:{revalidate:1800}}); if(!r.ok)throw new Error(`Lever ${c.slug}: ${r.status}`); const d=await r.json();
 return (d||[]).map((j:any)=>({source:'lever',externalId:String(j.id),sourceUrl:j.hostedUrl,company:c.company,title:j.text,location:j.categories?.location||'',description:strip([j.descriptionPlain,j.additionalPlain].filter(Boolean).join(' ')),postedAt:j.createdAt?new Date(j.createdAt).toISOString():undefined}));
}
