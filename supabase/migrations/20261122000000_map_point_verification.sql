begin;

alter table public.map_admin_points
  add column verification_source text check (
    char_length(verification_source) <= 1000 and verification_source ~ '^https?://[^[:space:]]+$'
  );

alter table public.map_suggestion_reviews
  add column verification_source text check (
    verification_source is null or (
      char_length(verification_source) <= 1000
      and verification_source ~ '^https?://[^[:space:]]+$'
      and decision = 'approved'
    )
  );

grant insert (verification_source) on public.map_admin_points to authenticated;

commit;
