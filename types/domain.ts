export type MatchBreakdown={qualifications:number;experience:number;responsibilities:number;industry:number;seniority:number;skills:number;location:number};
export type CandidateProfile={id?:string;fullName:string;headline:string;summary:string;yearsExperience:number;skills:string[];achievements:string[];education:string[];certifications:string[];targetTitles:string[];preferredLocations:string[];remotePreference:'remote'|'hybrid'|'onsite'|'any';salaryMin?:number;industries:string[]};
export type Job={id?:string;source:string;sourceUrl:string;company:string;title:string;location:string;description:string;postedAt?:string};
export type JobMatch={score:number;breakdown:MatchBreakdown;reasons:string[];gaps:string[]};
