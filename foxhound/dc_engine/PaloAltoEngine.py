from .Engine import Engine
from .Engine import pd


class PaloAltoEngine(Engine):
    def __init__(self, input_path: str, output_path: str):
        super().__init__(input_path, output_path)
        self._DATA_FIELDS = (
            'virtual_system',
            'source_ip', 'source_port',
            'destination_ip', 'destination_port',
            'bytes_sent', 'bytes_received', 'repeat_count',
            'application', 'packets_received', 'packets_sent',
            'ip_protocol', 'time_elapsed'
        )
        self._COLUMNS_TO_KEEP = [
            'Virtual System',
            'Source address', 'Source Port',
            'Destination address', 'Destination Port',
            'Bytes Sent', 'Bytes Received', 'Repeat Count',
            'Application', 'Packets Sent', 'Packets Received',
            'IP Protocol', 'Elapsed Time (sec)'
        ]

        self._INPUT_TO_OUTPUT_MAP = {
            j: i for i, j in zip(
                self._DATA_FIELDS,
                self._COLUMNS_TO_KEEP
            )
        }

    def _process(self, data: pd.DataFrame):
        data = data[self._COLUMNS_TO_KEEP]
        data.columns = [self._INPUT_TO_OUTPUT_MAP[c] for c in data.columns]
        return data
