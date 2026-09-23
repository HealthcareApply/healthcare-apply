import type {Job} from '@/types/domain';
export function inferRemote(text:string){if(/\bremote\b/i.test(text))return 'remote';if(/\bhybrid\b/i.test(text))return 'hybrid';if(/\bon[- ]?site|in office\b/i.test(text))return 'onsite';return 'unknown'}
export function normalizeJob(j:Job){return {...j,company:j.company.trim(),title:j.title.trim(),location:(j.location||'').trim(),description:j.description.replace(/\s+/g,' ').trim(),workMode:inferRemote(`${j.location} ${j.description}`)}}
