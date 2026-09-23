import OpenAI from 'openai';
export function getOpenAI(){if(!process.env.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY is not configured');return new OpenAI({apiKey:process.env.OPENAI_API_KEY});}
export const MODEL=process.env.OPENAI_MODEL||'gpt-5.6';
