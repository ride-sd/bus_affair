-- Bus 827 is the same model as the 801–826 range (2013 Gillig Low Floor CNG 40')
update fleet_entries
set range_end = 827
where agency = 'MTS'
  and range_start = 801
  and range_end = 826;
