from .Engine import Engine
from .Engine import pd


class PaloAltoEngine(Engine):
    def __init__(self, input_path: str, output_path: str):
        super().__init__(input_path, output_path)

        self._COLUMNS_TO_KEEP = [
            'Virtual System',
            'Source address', 'Source Port',
            'Destination address', 'Destination Port',
            'Bytes Sent', 'Bytes Received', 'Repeat Count',
            'Application', 'Packets Sent', 'Packets Received',
            'IP Protocol', 'Elapsed Time (sec)',
            'Source Zone', 'Destination Zone',
            'Rule', 'Time Logged'
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
