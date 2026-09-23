alter table profiles add column if not exists profile_verified boolean not null default false;
alter table profiles add column if not exists onboarding_complete boolean not null default false;
alter table profiles add column if not exists desired_salary_max int;
alter table profiles add column if not exists updated_at timestamptz default now();

create table if not exists resumes(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 storage_path text not null,
 original_filename text not null,
 mime_type text,
 extracted_text text,
 created_at timestamptz default now()
);
alter table resumes enable row level security;
create policy "own resumes" on resumes for all using(auth.uid()=user_id) with check(auth.uid()=user_id);

insert into storage.buckets(id,name,public) values('resumes','resumes',false) on conflict(id) do nothing;
create policy "resume upload own folder" on storage.objects for insert to authenticated with check(bucket_id='resumes' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "resume read own folder" on storage.objects for select to authenticated using(bucket_id='resumes' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "resume delete own folder" on storage.objects for delete to authenticated using(bucket_id='resumes' and (storage.foldername(name))[1]=auth.uid()::text);
