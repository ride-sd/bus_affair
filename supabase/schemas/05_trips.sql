create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  bus_number integer not null,
  bus_model_id uuid references bus_models(id),
  route_id uuid references bus_routes(id),
  type trip_type not null default 'seen',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create index trips_user_id_idx on trips (user_id);
create index trips_created_at_idx on trips (created_at desc);
create index trips_bus_number_idx on trips (bus_number);
