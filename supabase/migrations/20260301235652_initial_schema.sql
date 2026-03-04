-- ============================================================================
-- ENUMS
-- ============================================================================

create type fuel_type as enum ('CNG', 'Electric', 'Diesel', 'LPG', 'Gasoline');
create type encounter_type as enum ('seen', 'boarded');

-- ============================================================================
-- TABLES
-- ============================================================================

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

create table bus_routes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  agency text not null default 'MTS',
  route text not null,
  name text not null,
  unique(agency, route)
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

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

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table encounters enable row level security;
alter table bus_models enable row level security;
alter table fleet_entries enable row level security;
alter table bus_routes enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can read own encounters"
  on encounters for select using (auth.uid() = user_id);

create policy "Users can insert own encounters"
  on encounters for insert with check (auth.uid() = user_id);

create policy "Users can update own encounters"
  on encounters for update using (auth.uid() = user_id);

create policy "Users can delete own encounters"
  on encounters for delete using (auth.uid() = user_id);

create policy "Authenticated users can read bus_models"
  on bus_models for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read fleet_entries"
  on fleet_entries for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read bus_routes"
  on bus_routes for select using (auth.role() = 'authenticated');

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', null));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- LOOKUP FUNCTION: bus number → model
-- ============================================================================

create or replace function lookup_bus_model(bus_number integer, agency text)
returns uuid
language sql
stable
as $$
  select bus_model_id
  from fleet_entries
  where bus_number between range_start and range_end
    and fleet_entries.agency = lookup_bus_model.agency
  limit 1;
$$;
