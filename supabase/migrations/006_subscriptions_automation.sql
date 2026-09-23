-- Stage 6: subscriptions, usage metering, notifications, automation preferences
alter table profiles add column if not exists matching_enabled boolean not null default true;
alter table profiles add column if not exists minimum_match_score int not null default 70 check(minimum_match_score between 0 and 100);
alter table profiles add column if not exists email_match_notifications boolean not null default true;
alter table profiles add column if not exists email_follow_up_notifications boolean not null default true;

create table if not exists subscriptions(
 user_id uuid primary key references auth.users(id) on delete cascade,
 plan text not null default 'free' check(plan in ('free','pro','premium')),
 status text not null default 'active',
 stripe_customer_id text unique,
 stripe_subscription_id text unique,
 stripe_price_id text,
 current_period_end timestamptz,
 cancel_at_period_end boolean not null default false,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists usage_events(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 feature text not null, quantity int not null default 1 check(quantity>0), metadata jsonb not null default '{}', created_at timestamptz default now()
);
create table if not exists notifications(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null, dedupe_key text not null, subject text not null, body text not null,
 status text not null default 'pending' check(status in ('pending','sent','failed','skipped')),
 sent_at timestamptz, error text, created_at timestamptz default now(), unique(user_id,dedupe_key)
);
alter table subscriptions enable row level security; alter table usage_events enable row level security; alter table notifications enable row level security;
create policy "read own subscription" on subscriptions for select using(auth.uid()=user_id);
create policy "read own usage" on usage_events for select using(auth.uid()=user_id);
create policy "read own notifications" on notifications for select using(auth.uid()=user_id);
create index if not exists usage_events_user_feature_created_idx on usage_events(user_id,feature,created_at desc);
create index if not exists notifications_user_created_idx on notifications(user_id,created_at desc);
