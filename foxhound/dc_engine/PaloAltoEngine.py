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
        data.loc[:, 'virtual_system_id'] = data['virtual_system_id'].map(
            self._get_number_from_string)
        return data

    def _get_number_from_string(self, string: str):
        return int(''.join(x for x in string if x.isdigit()))
