from abc import ABC, abstractmethod
import csv


class Engine(ABC):

    def __init__(self, csv_path):
        if isinstance(csv_path, str):
            self._CSV_FILE_PATH = csv_path
        else:
            raise TypeError("csv_path must be a str instance")

        self._DATA_FIELDS = ('source_ip', 'source_port',
                             'source_country', 'destination_ip',
                             'destination_country', 'destination_port',
                             'bytes', 'repeat_count')

        self._INPUT_TO_OUTPUT_MAP = None

    def _read_csv(self):
        pass

    @abstractmethod
    def _process(self):
        pass

    def _dump(self):
        pass

    def run(self):
        _read_csv()
        _process()
        return _dump()
