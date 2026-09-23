alter table public.profiles add column if not exists beta_terms_accepted_at timestamptz;
alter table public.profiles add column if not exists data_export_requested_at timestamptz;

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.product_events enable row level security;
create policy "users insert own events" on public.product_events for insert to authenticated with check (auth.uid()=user_id);
create policy "users read own events" on public.product_events for select to authenticated using (auth.uid()=user_id);
create index if not exists product_events_name_created_idx on public.product_events(event_name,created_at desc);
