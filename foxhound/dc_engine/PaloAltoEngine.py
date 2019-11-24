import numpy as np

from .Engine import Engine
from .Engine import pd


class PaloAltoEngine(Engine):
    def __init__(
        self,
        input_path: str,
        log_detail_output_path: str,
        log_granular_hour_output_path: str
    ):
        super().__init__(
            input_path,
            log_detail_output_path,
            log_granular_hour_output_path
        )

        self._COLUMNS_TO_KEEP = [
            'Virtual System',
            'Source address', 'Source Port',
            'Destination address', 'Destination Port',
            'Bytes Sent', 'Bytes Received', 'Repeat Count',
            'Application', 'Packets Sent', 'Packets Received',
            'IP Protocol', 'Elapsed Time (sec)',
            'Source Zone', 'Destination Zone',
            'Rule', 'Time Logged', 'Inbound Interface',
            'Outbound Interface', 'Action',
            'Category', 'Session End Reason'
        ]

        self._INPUT_TO_OUTPUT_MAP = {
            j: i for i, j in zip(
                self._DATA_FIELDS,
                self._COLUMNS_TO_KEEP
            )
        }

    def _process(self, data: pd.DataFrame):
        data = data.copy()
        data = data[self._COLUMNS_TO_KEEP]
        data.columns = [self._INPUT_TO_OUTPUT_MAP[c] for c in data.columns]
        return data

    def _granularize(self, data):
        data = data.copy()
        drop_columns = [
            'Domain', 'Receive Time', 'Serial #', 'Type', 'Source Port',
            'Threat/Content Type', 'Config Version', 'Generate Time',
            'NAT Source IP', 'NAT Destination IP', 'Source User',
            'Destination User', 'Log Action', 'Time Logged', 'Session ID',
            'NAT Source Port', 'NAT Destination Port',
            'Flags', 'tpadding', 'Sequence Number', 'Action Flags',
            'DG Hierarchy Level 1', 'DG Hierarchy Level 2', 'DG Hierarchy Level 3',
            'DG Hierarchy Level 4', 'Virtual System Name', 'Device Name',
            'Action Source', 'Source VM UUID', 'Destination VM UUID',
            'Tunnel ID/IMSI', 'Monitor Tag/IMEI', 'Parent Session ID',
            'Parent Session Start Time', 'Tunnel', 'cpadding',
            'SCTP Association ID', 'SCTP Chunks', 'SCTP Chunks Sent',
            'SCTP Chunks Received', 'Source Country', 'Destination Country',
        ]
        data.drop(drop_columns, axis=1, inplace=True)
        data['date'] = pd.to_datetime(data['Start Time'])
        data.set_index('date', inplace=True)
        data.index = data.index.floor('1H')
        data.drop(['Start Time'], axis=1, inplace=True)
        group_columns = [
            'date', 'Source address', 'Destination address', 'Rule',
            'Application', 'Virtual System', 'Source Zone',
            'Destination Zone', 'Inbound Interface', 'Outbound Interface',
            'Destination Port', 'IP Protocol', 'Action',
            'Category', 'Session End Reason'
        ]
        data = data.groupby(group_columns)
        data = data.agg({
            'Repeat Count': 'mean',
            'Bytes': 'sum',
            'Bytes Sent': 'sum',
            'Bytes Received': 'sum',
            'Packets': 'sum',
            'Elapsed Time (sec)': 'sum',
            'Packets Sent': 'sum',
            'Packets Received': 'sum'
        }).reset_index()
        data.rename({
            'date': 'logged_datetime',
            'Source address': 'source_ip_id',
            'Destination address': 'destination_ip_id',
            'Rule': 'firewall_rule_id',
            'Application': 'application_id',
            'Virtual System': 'virtual_system_id',
            'Source Zone': 'source_zone_id',
            'Destination Zone': 'destination_zone_id',
            'Inbound Interface': 'inbound_interface_id',
            'Outbound Interface': 'outbound_interface_id',
            'Destination Port': 'destination_port',
            'IP Protocol': 'protocol_id',
            'Action': 'action_id',
            'Category': 'category_id',
            'Session End Reason': 'session_end_reason_id',
            'Repeat Count': 'repeat_count',
            'Bytes': 'bytes',
            'Bytes Sent': 'bytes_sent',
            'Bytes Received': 'bytes_received',
            'Packets': 'packets',
            'Elapsed Time (sec)': 'elapsed_time',
            'Packets Sent': 'packets_sent',
            'Packets Received': 'packets_received'
        }, axis=1, inplace=True)
        data.logged_datetime = data.logged_datetime.values.astype(
            np.int64) // 10 ** 9
        return data
