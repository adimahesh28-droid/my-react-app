-- Move planner progress out of Auth metadata before it makes every JWT too large.
-- The migration preserves all supported progress keys in public.user_progress
-- before removing only those keys from auth.users.raw_user_meta_data.

begin;

create table if not exists public.user_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  progress_key text not null,
  progress_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, progress_key)
);

alter table public.user_progress enable row level security;

grant select, insert, update, delete on public.user_progress to authenticated;

drop policy if exists "Users can manage their own progress" on public.user_progress;
create policy "Users can manage their own progress"
  on public.user_progress
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into public.user_progress (user_id, progress_key, progress_data)
select u.id, entry.key, entry.value
from auth.users as u
cross join lateral jsonb_each(coalesce(u.raw_user_meta_data, '{}'::jsonb)) as entry(key, value)
where entry.key in (
  'gate_progress',
  'cat_progress',
  'gate_mountain_os_v1',
  'gate_mountain_progress_v2',
  'gate_mountain_progress_v3'
)
on conflict (user_id, progress_key) do nothing;

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  - array[
    'gate_progress',
    'cat_progress',
    'gate_mountain_os_v1',
    'gate_mountain_progress_v2',
    'gate_mountain_progress_v3'
  ]::text[]
where coalesce(raw_user_meta_data, '{}'::jsonb) ?| array[
  'gate_progress',
  'cat_progress',
  'gate_mountain_os_v1',
  'gate_mountain_progress_v2',
  'gate_mountain_progress_v3'
];

commit;
