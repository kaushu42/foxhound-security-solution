# row_number,virtual_system_id,source_ip_id,source_port,destination_ip_id,destination_port,bytes_sent,bytes_received,repeat_count,application_id,packets_received,packets_sent,protocol_id,time_elapsed,source_zone_id,destination_zone_id,firewall_rule_id,logged_datetime,inbound_interface_id,outbound_interface_id,action_id,category_id,session_end_reason_id
required_columns = ['Threat/Content Type', 'Source address', 'Destination address', 'NAT Source IP',
                    'NAT Destination IP', 'Application', 'Log Action',
                    'NAT Destination Port', 'Rule', 'Flags', 'IP Protocol', 'Source Zone', 'Destination Zone',
                    'Inbound Interface', 'Outbound Interface', 'Action', 'Category',
                    'Session End Reason',  'Destination Port', 'Source Port',
                    'Bytes Sent', 'Bytes Received', 'Repeat Count', 'Packets Received',
                    'Packets Sent', 'Start Time', 'Elapsed Time (sec)', 'Virtual System', 'Device Name']

header_names = ["threat_content_type", "source_address", "destination_address", 'nat_source_ip',
                "nat_destination_ip", "application", "log_action",
                "nat_destination_port", "firewall_rule", "flags", "protocol", "source_zone", "destination_zone",
                "inbound_interface", "outbound_interface", "action", "category",
                "session_end_reason", "destination_port", "source_port",
                "bytes_sent", "bytes_received", "repeat_count", "packets_received",
                "packets_sent", "logged_datetime", "time_elapsed", 'vsys', 'device_name']


features_list = ['Start Time',
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
