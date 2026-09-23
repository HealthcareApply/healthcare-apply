create table if not exists job_sources(
 id uuid primary key default gen_random_uuid(),
 provider text not null check(provider in ('greenhouse','lever')),
 slug text not null,
 company text not null,
 active boolean not null default true,
 created_at timestamptz default now(),
 unique(provider,slug)
);
-- Sources are global configuration. Manage these with the Supabase service/dashboard, not from the browser.
create index if not exists job_matches_user_score_idx on job_matches(user_id,score desc);
create index if not exists jobs_posted_idx on jobs(posted_at desc);
