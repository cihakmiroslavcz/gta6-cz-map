begin;

create table public.map_suggestion_reviews (
  suggestion_id uuid primary key references public.map_suggestions(id),
  decision text not null check (decision in ('approved', 'rejected')),
  name text,
  description text,
  category text,
  type text,
  x numeric(8, 3),
  y numeric(8, 3),
  check (
    (
      decision = 'approved'
      and name is not null and char_length(name) <= 120 and name ~ '[^[:space:]]'
      and description is not null and char_length(description) <= 3000 and description ~ '[^[:space:]]'
      and category is not null and category in ('city', 'nature', 'landmark')
      and type is not null and type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64
      and x is not null and x between -16384 and 16384
      and y is not null and y between -16384 and 16384
    ) or (
      decision = 'rejected'
      and name is null and description is null and category is null and type is null and x is null and y is null
    )
  )
);

alter table public.map_suggestion_reviews enable row level security;

revoke all on public.map_suggestion_reviews from public, anon, authenticated;
grant select on public.map_suggestion_reviews to anon, authenticated;
grant insert on public.map_suggestion_reviews to authenticated;

create policy map_suggestion_reviews_read_approved on public.map_suggestion_reviews
  for select to anon, authenticated using (decision = 'approved');

create policy map_suggestion_reviews_read_as_admin on public.map_suggestion_reviews
  for select to authenticated using (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  );

create policy map_suggestion_reviews_insert_as_admin on public.map_suggestion_reviews
  for insert to authenticated with check (
    exists (select 1 from public.map_admins where user_id = (select auth.uid()))
  );

alter table public.map_hidden_points
  drop constraint map_hidden_points_point_id_check,
  add constraint map_hidden_points_point_id_check check (
    point_id ~ '^(L[0-9]+|S[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$'
  );

commit;
