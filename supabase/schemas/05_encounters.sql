create table encounters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  bus_number integer not null,
  agency text not null,
  bus_model_id uuid references bus_models(id),
  route_id uuid references bus_routes(id),
  type encounter_type not null default 'seen',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create index encounters_user_created_idx on encounters (user_id, created_at desc);
create index encounters_user_bus_idx on encounters (user_id, bus_number);
