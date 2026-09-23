export type Plan='free'|'pro'|'premium';
export type Feature='manual_job_analysis'|'application_generation'|'contact_research';
export const PLANS:Record<Plan,{name:string;monthlyPrice:number;limits:Record<Feature,number>;dailyMatching:boolean}>={
 free:{name:'Free',monthlyPrice:0,limits:{manual_job_analysis:5,application_generation:2,contact_research:0},dailyMatching:false},
 pro:{name:'Pro',monthlyPrice:19,limits:{manual_job_analysis:50,application_generation:25,contact_research:15},dailyMatching:true},
 premium:{name:'Premium',monthlyPrice:39,limits:{manual_job_analysis:200,application_generation:100,contact_research:75},dailyMatching:true}
};
export function planFromPrice(price?:string|null):Plan{if(price&&price===process.env.STRIPE_PREMIUM_PRICE_ID)return'premium';if(price&&price===process.env.STRIPE_PRO_PRICE_ID)return'pro';return'free'}
