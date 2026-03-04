-- Allow anonymous (unauthenticated) reads on reference tables.
-- The initial schema required auth.role() = 'authenticated', but the app
-- currently uses only the anon key (no user auth yet).

drop policy "Authenticated users can read bus_models" on bus_models;
drop policy "Authenticated users can read fleet_entries" on fleet_entries;
drop policy "Authenticated users can read bus_routes" on bus_routes;

create policy "Anyone can read bus_models"
  on bus_models for select using (true);

create policy "Anyone can read fleet_entries"
  on fleet_entries for select using (true);

create policy "Anyone can read bus_routes"
  on bus_routes for select using (true);
