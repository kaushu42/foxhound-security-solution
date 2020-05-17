# row_number,virtual_system_id,source_ip_id,source_port,destination_ip_id,destination_port,bytes_sent,bytes_received,repeat_count,application_id,packets_received,packets_sent,protocol_id,time_elapsed,source_zone_id,destination_zone_id,firewall_rule_id,logged_datetime,inbound_interface_id,outbound_interface_id,action_id,category_id,session_end_reason_id
features_list = ['Time Logged',
                 'Rule',
                 'Source address',
                 'Destination address',
                 'Application',
                 'Source Zone',
                #  'Source Port',
                 'Destination Port',
                 'IP Protocol',
                 'Repeat Count',
                 'Category',
                 'Action',
                 'Bytes Sent',
                 'Bytes Received',
                 'Packets Sent',
                 'Packets Received',
                 'Elapsed Time (sec)',
                 'Session End Reason']

features_to_convert_to_number = [
    'Destination address',
    'Application',
    'Source Zone',
    # 'Source Port',
    # 'Destination Port',
    'IP Protocol',
    'Category',
    'Action',
    'Session End Reason'
]

categorical_features = [
    'Application',
    'Source Zone',
    'Destination Port',
    'IP Protocol',
    'Category',
    'Action',
    'Session End Reason'
]
