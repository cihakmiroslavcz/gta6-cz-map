begin;

create table public.map_admin_points (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120 and name ~ '[^[:space:]]'),
  description text check (char_length(description) <= 3000 and description ~ '[^[:space:]]'),
  category text not null check (category in ('city', 'nature', 'landmark')),
  type text not null check (type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64),
  x numeric(8, 3) not null check (x between -16384 and 16384),
  y numeric(8, 3) not null check (y between -16384 and 16384)
);

alter table public.map_admin_points enable row level security;

revoke all on public.map_admin_points from public, anon, authenticated;
grant select on public.map_admin_points to anon, authenticated;
grant insert (name, description, category, type, x, y) on public.map_admin_points to authenticated;

create policy map_admin_points_read on public.map_admin_points
  for select to anon, authenticated using (true);

create policy map_admin_points_insert_as_admin on public.map_admin_points
  for insert to authenticated with check (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  );

alter table public.map_hidden_points
  drop constraint map_hidden_points_point_id_check,
  add constraint map_hidden_points_point_id_check check (
    point_id ~ '^(L[0-9]+|[AS][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$'
  );

commit;
