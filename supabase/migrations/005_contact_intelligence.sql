-- Stage 5: Recruiter / Hiring Manager Intelligence
alter table contacts add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table contacts add column if not exists contact_type text default 'unknown';
alter table contacts add column if not exists discovery_method text;
alter table contacts add column if not exists evidence text;
alter table contacts add column if not exists updated_at timestamptz default now();

alter table contacts enable row level security;
drop policy if exists "own contacts" on contacts;
create policy "own contacts" on contacts for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create index if not exists contacts_user_job_idx on contacts(user_id,job_id,confidence desc);
