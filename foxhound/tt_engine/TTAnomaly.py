import os


class TTAnomaly:

    def __init__(self, input_dir):
        self._input_dir = input_dir
        self._FILES = os.listdir(self._input_dir)

    def _get_files(self):
        self._FILES = os.listdir(self._input_dir)

    def _read_csv(self, path):
        return pd.read_csv(path)
