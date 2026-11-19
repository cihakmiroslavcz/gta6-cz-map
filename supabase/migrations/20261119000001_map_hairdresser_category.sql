begin;

alter table public.map_admin_points
  drop constraint map_admin_points_category_check,
  add constraint map_admin_points_category_check check (
    category in ('city', 'hairdresser', 'nature', 'landmark')
  );

alter table public.map_suggestion_reviews
  drop constraint map_suggestion_reviews_check,
  add constraint map_suggestion_reviews_check check (
    (
      decision = 'approved'
      and name is not null and char_length(name) <= 120 and name ~ '[^[:space:]]'
      and description is not null and char_length(description) <= 3000 and description ~ '[^[:space:]]'
      and category is not null and category in ('city', 'hairdresser', 'nature', 'landmark')
      and type is not null and type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64
      and x is not null and x between -16384 and 16384
      and y is not null and y between -16384 and 16384
    ) or (
      decision = 'rejected'
      and name is null and description is null and category is null and type is null and x is null and y is null
    )
  );

update public.map_suggestion_reviews
set category = 'hairdresser', type = 'hairSalon'
where suggestion_id = '93f1f9c4-dbe0-45d3-a597-fe4e8959519d'
  and decision = 'approved' and category = 'city' and type = 'service';

commit;
