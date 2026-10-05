-- Reconcile fleet data with the CPTDB wiki (October 2026).
-- Retired series that are still in the table (701-731, 2923-2927, 3001-3006, 3101-3131)
-- are intentionally kept so historical encounters still resolve to a model.

-- New models
insert into bus_models (slug, manufacturer, model, length_ft, fuel_type, year_introduced, description) values
  ('2026-new-flyer-xn40', 'New Flyer', 'XN40', 40, 'CNG', 2026, 'The 4xx-series Xcelsior 40-foot CNG buses delivered in 2026, following the 3xx-series XN40s from the same contract.'),
  ('2024-ford-starcraft-e450-allstar-25', 'Ford/Starcraft', 'E-450/Allstar 25', 25, 'Gasoline', 2024, 'Starcraft-bodied cutaway on a Ford E-450 chassis with a 7.3L V8 gasoline engine. Used for community and rural service from East County.'),
  ('2025-ford-starcraft-f550', 'Ford/Starcraft', 'F-550', 32, 'Gasoline', 2025, 'Starcraft-bodied cutaway on a Ford F-550 chassis. Exact model and length not confirmed on the wiki.'),
  ('2026-ford-starcraft-f550', 'Ford/Starcraft', 'F-550', 32, 'Gasoline', 2026, 'Starcraft-bodied cutaway on a Ford F-550 chassis. Exact model and length not confirmed on the wiki.');

-- The 2019 F550/Allstar XL is 32', not 25'
update bus_models set length_ft = 32 where slug = '2019-ford-starcraft-f550-allstar-xl';

-- 3xx: only 301-338 have been delivered so far
update fleet_entries set range_end = 338
where agency = 'MTS' and range_start = 301 and range_end = 390;

-- 801-826 plus 827-828 (renumbered from 2313-2314)
update fleet_entries set range_end = 828
where agency = 'MTS' and range_start = 801 and range_end = 827;

-- 2313-2314 became 827-828
delete from fleet_entries where agency = 'MTS' and range_start = 2301 and range_end = 2324;

-- 2901-2922 are 2012 C40LFRs; 2923-2927 are the 2011 units renumbered from 622-626
delete from fleet_entries where agency = 'MTS' and range_start = 2901 and range_end = 2927;

-- 7601-7613 delivered so far (91 expected)
update fleet_entries set range_end = 7613
where agency = 'MTS' and range_start = 7601 and range_end = 7691;

insert into fleet_entries (agency, range_start, range_end, bus_model_id) values
  ('MTS', 421,  453,  (select id from bus_models where slug = '2026-new-flyer-xn40')),
  ('MTS', 2301, 2312, (select id from bus_models where slug = '2013-gillig-low-floor-cng-40')),
  ('MTS', 2315, 2324, (select id from bus_models where slug = '2013-gillig-low-floor-cng-40')),
  ('MTS', 2901, 2922, (select id from bus_models where slug = '2012-new-flyer-c40lfr')),
  ('MTS', 2923, 2927, (select id from bus_models where slug = '2011-new-flyer-c40lfr')),
  ('MTS', 3401, 3424, (select id from bus_models where slug = '2024-ford-starcraft-e450-allstar-25')),
  ('MTS', 3501, 3503, (select id from bus_models where slug = '2026-ford-starcraft-f550')),
  ('MTS', 3551, 3557, (select id from bus_models where slug = '2025-ford-starcraft-f550'));
