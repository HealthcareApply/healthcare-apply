-- Stage 4: Application Studio + Career CRM
alter table applications add column if not exists current_version int not null default 1;
alter table applications add column if not exists submitted_resume_version int;
alter table applications add column if not exists submitted_cover_letter_version int;

create table if not exists application_versions(
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null references applications(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 version int not null,
 tailored_resume text not null default '',
 cover_letter text not null default '',
 recruiter_email text not null default '',
 linkedin_message text not null default '',
 generation_notes jsonb not null default '[]',
 created_at timestamptz default now(),
 unique(application_id,version)
);

create table if not exists application_events(
 id uuid primary key default gen_random_uuid(),
 application_id uuid not null references applications(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 event_type text not null,
 detail text,
 created_at timestamptz default now()
);

alter table application_versions enable row level security;
alter table application_events enable row level security;
create policy "own application versions" on application_versions for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own application events" on application_events for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create index if not exists application_versions_app_version_idx on application_versions(application_id,version desc);
create index if not exists application_events_app_created_idx on application_events(application_id,created_at desc);
