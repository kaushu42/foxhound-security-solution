---------------FIREWALL RULE ON GRANULAR HOURLY---------------------------------------------------
create index idx_fh_prd_trfc_log_dtl_hr_a_frwl_rule ON fh_prd_trfc_log_dtl_hr_a(firewall_rule_id);
create index idx_fh_prd_trfc_log_dtl_hr_a_frwl_rule_src_addr ON fh_prd_trfc_log_dtl_hr_a(firewall_rule_id, source_address);

---------------FIREWALL RULE ON RULES-------------------------------------------------------------
create index idx_fh_prd_trfc_rule_f_frwl_rule ON fh_prd_trfc_rule_f(firewall_rule_id);

---------------FILTER AND LOGGED DATETIME ON TIME SERIES CHART------------------------------------
create index idx_fh_prd_trfc_chrt_tm_srs_dt_hr_a_fltr ON fh_prd_trfc_chrt_tm_srs_dt_hr_a(filter_id);
create index idx_fh_prd_trfc_chrt_tm_srs_dt_hr_a_fltr_lgdt ON fh_prd_trfc_chrt_tm_srs_dt_hr_a(filter_id, logged_datetime);

---------------FIREWALL RULE AND LOGGED DATETIME ON MIS DAILY SOURCE------------------------------------
create index idx_fh_prd_trfc_mis_new_src_ip_dy_a_frwl_rule ON fh_prd_trfc_mis_new_src_ip_dy_a(firewall_rule_id);
create index idx_fh_prd_trfc_mis_new_src_ip_dy_a_frwl_lgdt ON fh_prd_trfc_mis_new_src_ip_dy_a(firewall_rule_id, logged_datetime);

---------------FIREWALL RULE AND LOGGED DATETIME ON MIS DAILY DESTINATION------------------------------------
create index idx_fh_prd_trfc_mis_new_dst_ip_dy_a_frwl_rule ON fh_prd_trfc_mis_new_dst_ip_dy_a(firewall_rule_id);
create index idx_fh_prd_trfc_mis_new_dst_ip_dy_a_frwl_lgdt ON fh_prd_trfc_mis_new_dst_ip_dy_a(firewall_rule_id, logged_datetime);

-----COUNTRY LIST-----
create index idx_fh_prd_trfc_log_dtl_hr_a_frwl_rule_src_ctry ON fh_prd_trfc_log_dtl_hr_a(firewall_rule_id, source_country);
create index idx_fh_prd_trfc_log_dtl_hr_a_frwl_rule_dst_ctry ON fh_prd_trfc_log_dtl_hr_a(firewall_rule_id, destination_country);

----MIS BLACKLIST SOURCE
create index idx_fh_prd_trfc_mis_req_frm_blip_dy_a_frwl_rule_src_dst ON fh_prd_trfc_mis_req_frm_blip_dy_a(firewall_rule_id, source_address, destination_address);
create index idx_fh_prd_trfc_mis_req_frm_blip_dy_a_frwl_rule_src ON fh_prd_trfc_mis_req_frm_blip_dy_a(firewall_rule_id, source_address);
create index idx_fh_prd_trfc_mis_req_frm_blip_dy_a_frwl_rule_dst ON fh_prd_trfc_mis_req_frm_blip_dy_a(firewall_rule_id, destination_address);

create index idx_fh_prd_trfc_mis_res_to_blip_dy_a_frwl_rule_src_dst ON fh_prd_trfc_mis_res_to_blip_dy_a(firewall_rule_id, source_address, destination_address);
create index idx_fh_prd_trfc_mis_res_to_blip_dy_a_frwl_rule_src ON fh_prd_trfc_mis_res_to_blip_dy_a(firewall_rule_id, source_address);
create index idx_fh_prd_trfc_mis_res_to_blip_dy_a_frwl_rule_dst ON fh_prd_trfc_mis_res_to_blip_dy_a(firewall_rule_id, destination_address);