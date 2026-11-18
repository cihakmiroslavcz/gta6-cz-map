begin;

create table public.map_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table public.map_hidden_points (
  point_id text primary key check (point_id ~ '^L[0-9]+$')
);

alter table public.map_admins enable row level security;
alter table public.map_hidden_points enable row level security;

revoke all on public.map_admins, public.map_hidden_points from public, anon, authenticated;
grant select on public.map_admins to authenticated;
grant select on public.map_hidden_points to anon, authenticated;
grant insert, delete on public.map_hidden_points to authenticated;

create policy map_admins_read_own on public.map_admins
  for select to authenticated using (user_id = (select auth.uid()));

create policy map_hidden_points_read on public.map_hidden_points
  for select to anon, authenticated using (true);

create policy map_hidden_points_insert_as_admin on public.map_hidden_points
  for insert to authenticated with check (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  );

create policy map_hidden_points_delete_as_admin on public.map_hidden_points
  for delete to authenticated using (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  );

commit;
