begin;

create table public.map_point_edits (
  point_id text primary key check (point_id ~ '^(L[0-9]+|[AS][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$'),
  name text not null check (char_length(name) <= 120 and name ~ '[^[:space:]]'),
  description text check (char_length(description) <= 3000 and description ~ '[^[:space:]]'),
  category text not null check (category in ('city', 'hairdresser', 'nature', 'landmark')),
  type text not null check (type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64)
);

alter table public.map_point_edits enable row level security;

revoke all on public.map_point_edits from public, anon, authenticated;
grant select on public.map_point_edits to anon, authenticated;
grant insert, update on public.map_point_edits to authenticated;

create policy map_point_edits_read on public.map_point_edits
  for select to anon, authenticated using (true);

create policy map_point_edits_insert_as_admin on public.map_point_edits
  for insert to authenticated with check (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  );

create policy map_point_edits_update_as_admin on public.map_point_edits
  for update to authenticated using (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  );

commit;
