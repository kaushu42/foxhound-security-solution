import os

from foxhound.db_engine.core_models import IPCountry


class TTAnomaly:

    def __init__(self, input_dir):
        self._input_dir = input_dir
        self._FILES = self._get_files()

    def _get_files(self):
        self._FILES = [
            f for f in os.listdir(
                self._input_dir
            ) if f.endswith('.csv')
        ]

    def _read_csv(self, path):
        return pd.read_csv(path)
