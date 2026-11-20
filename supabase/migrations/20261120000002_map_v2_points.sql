begin;

alter table public.map_admins add column manages_map_v2 boolean not null default false;
create unique index map_admins_single_v2_owner on public.map_admins (manages_map_v2) where manages_map_v2;

update public.map_admins
set manages_map_v2 = true
where (select count(*) from public.map_admins) = 1;

create table public.map_v2_points (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120 and name ~ '[^[:space:]]'),
  description text check (char_length(description) <= 3000 and description ~ '[^[:space:]]'),
  type text not null check (type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64),
  x numeric(8, 3) not null check (x between -16384 and 16384),
  y numeric(8, 3) not null check (y between -16384 and 16384),
  source text not null check (char_length(source) <= 1000 and source ~ '[^[:space:]]'),
  created_at timestamptz not null default now()
);

alter table public.map_v2_points enable row level security;

revoke all on public.map_v2_points from public, anon, authenticated;
grant select on public.map_v2_points to authenticated;
grant insert (name, description, type, x, y, source),
  update (name, description, type, x, y, source)
  on public.map_v2_points to authenticated;

create policy map_v2_points_owner on public.map_v2_points
  for all to authenticated using (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()) and manages_map_v2)
  ) with check (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()) and manages_map_v2)
  );

commit;
