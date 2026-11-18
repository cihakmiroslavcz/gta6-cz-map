begin;

create table public.map_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120 and name ~ '[^[:space:]]'),
  description text not null check (char_length(description) <= 3000 and description ~ '[^[:space:]]'),
  x numeric(8, 3) not null check (x between -16384 and 16384),
  y numeric(8, 3) not null check (y between -16384 and 16384),
  zoom smallint not null check (zoom between 0 and 5),
  created_at timestamptz not null default now()
);

alter table public.map_suggestions enable row level security;

revoke all on public.map_suggestions from public, anon, authenticated;
grant insert (name, description, x, y, zoom) on public.map_suggestions to anon;
grant select on public.map_suggestions to authenticated;

create policy map_suggestions_submit on public.map_suggestions
  for insert to anon with check (true);

create policy map_suggestions_read_as_admin on public.map_suggestions
  for select to authenticated using (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  );

commit;
