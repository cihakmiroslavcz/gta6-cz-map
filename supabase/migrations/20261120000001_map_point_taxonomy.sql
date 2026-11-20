begin;

alter table public.map_admin_points drop constraint map_admin_points_category_check;
alter table public.map_point_edits drop constraint map_point_edits_category_check;
alter table public.map_suggestion_reviews drop constraint map_suggestion_reviews_check;
alter table public.map_suggestions drop constraint map_suggestions_classification_check;

create function pg_temp.updated_point_category(category text, type text)
returns text
language sql
immutable
as $$
  select case
    when type in (
      'arcadeMachine', 'arena', 'basketball', 'billiards', 'casino', 'droneRace',
      'event', 'ferrisWheel', 'fishing', 'gangCompound', 'golfCourse', 'gym',
      'leisure', 'miniGolf', 'parachuting', 'race', 'racetrack', 'randomEvent',
      'shootingRange', 'stadium', 'tennis', 'volleyball'
    ) then 'activities'
    when type in (
      'atm', 'attraction', 'church', 'cinema', 'fireStation', 'hospital',
      'hotel', 'industrial', 'lighthouse', 'marina', 'museum', 'nightclub',
      'office', 'police', 'publicBuilding', 'service', 'stripclub', 'town',
      'transmitter', 'warehouse', 'waterTower'
    ) then 'localPlaces'
    when type in (
      'hill', 'lake', 'mountain', 'naturalSite', 'park', 'ridge',
      'waterway'
    ) then 'nature'
    when type in (
      'gunShop', 'pawnshop', 'pharmacy', 'shop', 'supermarket'
    ) then 'shop'
    when type in (
      'bar', 'cafeTakeout', 'convenienceStore', 'fastFood', 'liquorStore', 'restaurant',
      'streetFood'
    ) then 'foodDrink'
    when type in (
      'barberShop', 'clothingStore', 'electronicsStore', 'hairSalon', 'shoeStore', 'tattoo'
    ) then 'style'
    when type in (
      'airport', 'autoShop', 'bridge', 'busStop', 'carWash', 'evCharger',
      'gasStation', 'metroStation', 'modShop', 'motorcycleShop', 'parking', 'payNSpray',
      'specialVehicle', 'trainStation', 'transit', 'tunnel', 'vehicleRental', 'vehicleRequest',
      'vehicleSpawn'
    ) then 'vehicles'
    when type in (
      'garage', 'residential', 'safehouse'
    ) then 'properties'
    when type in (
      'baseJump', 'bookSwap', 'hiddenPackage', 'knifeFlight', 'magazine', 'messageInBottle',
      'meteorite', 'mural', 'photoCuriosity', 'photoLandmark', 'photoSculpture', 'playlist',
      'stuntJump', 'treasure', 'underBridge'
    ) then 'collectibles'
    when type in (
      'bank', 'fence', 'illegalOperation', 'paydayLoan', 'safe', 'smashAndGrab',
      'towableAtm'
    ) then 'robberies'
    when category = 'gasStation' then 'vehicles'
    when category = 'restaurant' then 'foodDrink'
    when category in ('city', 'landmark') then 'localPlaces'
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

update public.map_suggestions
set category = pg_temp.updated_point_category(category, type)
where category is not null
  and category is distinct from pg_temp.updated_point_category(category, type);

alter table public.map_admin_points
  add constraint map_admin_points_category_check check (
    category in ('activities', 'collectibles', 'foodDrink', 'localPlaces', 'nature', 'properties', 'robberies', 'shop', 'style', 'vehicles')
  );

alter table public.map_point_edits
  add constraint map_point_edits_category_check check (
    category in ('activities', 'collectibles', 'foodDrink', 'localPlaces', 'nature', 'properties', 'robberies', 'shop', 'style', 'vehicles')
  );

alter table public.map_suggestion_reviews
  add constraint map_suggestion_reviews_check check (
    (
      decision = 'approved'
      and name is not null and char_length(name) <= 120 and name ~ '[^[:space:]]'
      and description is not null and char_length(description) <= 3000 and description ~ '[^[:space:]]'
      and category is not null and category in ('activities', 'collectibles', 'foodDrink', 'localPlaces', 'nature', 'properties', 'robberies', 'shop', 'style', 'vehicles')
      and type is not null and type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64
      and x is not null and x between -16384 and 16384
      and y is not null and y between -16384 and 16384
    ) or (
      decision = 'rejected'
      and name is null and description is null and category is null and type is null and x is null and y is null
    )
  );

alter table public.map_suggestions
  add constraint map_suggestions_classification_check check (
    (category is null and type is null) or (
      category is not null and category in ('activities', 'collectibles', 'foodDrink', 'localPlaces', 'nature', 'properties', 'robberies', 'shop', 'style', 'vehicles')
      and type is not null and type ~ '^[A-Za-z][A-Za-z0-9]*$' and char_length(type) <= 64
    )
  );

drop function pg_temp.updated_point_category(text, text);

commit;
