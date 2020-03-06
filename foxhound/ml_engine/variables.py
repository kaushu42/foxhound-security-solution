# row_number,virtual_system_id,source_ip_id,source_port,destination_ip_id,destination_port,bytes_sent,bytes_received,repeat_count,application_id,packets_received,packets_sent,protocol_id,time_elapsed,source_zone_id,destination_zone_id,firewall_rule_id,logged_datetime,inbound_interface_id,outbound_interface_id,action_id,category_id,session_end_reason_id
features_list = ['logged_datetime',
                 'firewall_rule_id',
                 'source_ip_id',
                 'destination_ip_id',
                 'application_id',
                 'source_zone_id',
                 'source_port',
                 'destination_port',
                 'protocol_id',
                 'repeat_count',
                 'category_id',
                 'action_id',
                 'bytes_sent',
                 'bytes_received',
                 'session_end_reason_id',
                 'packets_sent',
                 'time_elapsed',
                 'packets_received']

features_to_convert_to_number = [
    'destination_ip_id',
    'application_id',
    'source_zone_id',
    'source_port',
    'destination_port',
    'protocol_id',
    'category_id',
    'action_id',
    'session_end_reason_id', 
]

categorical_features = [
    'application_id',
    'source_zone_id',
#     'source_port',
    'destination_port',
    'protocol_id',
    'category_id',
    'action_id',
    'session_end_reason_id',
]
