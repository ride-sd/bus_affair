create table fleet_entries (
  id uuid primary key default gen_random_uuid(),
  agency text not null,
  range_start integer not null,
  range_end integer not null,
  bus_model_id uuid not null references bus_models(id),
  constraint fleet_entries_range_check check (range_start <= range_end),
  constraint fleet_entries_range_unique unique (agency, range_start, range_end)
);

create index fleet_entries_range_idx on fleet_entries (range_start, range_end);
