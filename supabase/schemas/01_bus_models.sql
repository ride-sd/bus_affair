create table bus_models (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  manufacturer text not null,
  model text not null,
  length_ft integer not null,
  fuel_type fuel_type not null,
  year_introduced integer not null,
  division text,
  description text
);
