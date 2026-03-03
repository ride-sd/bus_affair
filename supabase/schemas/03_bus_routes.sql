create table bus_routes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  agency text not null default 'MTS',
  route text not null,
  name text not null,
  unique(agency, route)
);
