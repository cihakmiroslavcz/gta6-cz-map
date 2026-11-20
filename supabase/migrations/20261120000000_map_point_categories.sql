begin;

alter table public.map_admin_points drop constraint map_admin_points_category_check;
alter table public.map_point_edits drop constraint map_point_edits_category_check;
alter table public.map_suggestion_reviews drop constraint map_suggestion_reviews_check;

create function pg_temp.updated_point_category(category text, type text)
returns text
language sql
immutable
as $$
  select case
    when type = 'restaurant' then 'restaurant'
    when type = 'gasStation' then 'gasStation'
    when type in (
      'shop', 'clothingStore', 'shoeStore', 'electronicsStore', 'liquorStore',
      'motorcycleShop', 'supermarket', 'pawnshop', 'gunShop'
    ) then 'shop'
    when type in ('hairSalon', 'barberShop') or category = 'hairdresser' then 'city'
    else category
  end;
$$;

update public.map_admin_points
set category = pg_temp.updated_point_category(category, type)
where category is distinct from pg_temp.updated_point_category(category, type);

update public.map_point_edits
set category = pg_temp.updated_point_category(category, type)
where category is distinct from pg_temp.updated_point_category(category, type);

update public.map_suggestion_reviews
set category = pg_temp.updated_point_category(category, type)
where decision = 'approved'
  and category is distinct from pg_temp.updated_point_category(category, type);

alter table public.map_admin_points
  add constraint map_admin_points_category_check check (
    category in ('city', 'nature', 'landmark', 'restaurant', 'shop', 'gasStation')
  );

alter table public.map_point_edits
  add constraint map_point_edits_category_check check (
    category in ('city', 'nature', 'landmark', 'restaurant', 'shop', 'gasStation')
  );

alter table public.map_suggestion_reviews
  add constraint map_suggestion_reviews_check check (
    (
      decision = 'approved'
      and name is not null and char_length(name) <= 120 and name ~ '[^[:space:]]'
      and description is not null and char_length(description) <= 3000 and description ~ '[^[:space:]]'
      and category is not null and category in ('city', 'nature', 'landmark', 'restaurant', 'shop', 'gasStation')
      and type is not null and type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64
      and x is not null and x between -16384 and 16384
      and y is not null and y between -16384 and 16384
    ) or (
      decision = 'rejected'
      and name is null and description is null and category is null and type is null and x is null and y is null
    )
  );

alter table public.map_suggestions
  add column category text,
  add column type text,
  add constraint map_suggestions_classification_check check (
    (category is null and type is null) or (
      category is not null and category in ('city', 'nature', 'landmark', 'restaurant', 'shop', 'gasStation')
      and type is not null and type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64
    )
  );

grant insert (category, type) on public.map_suggestions to anon;

drop function pg_temp.updated_point_category(text, text);

commit;
