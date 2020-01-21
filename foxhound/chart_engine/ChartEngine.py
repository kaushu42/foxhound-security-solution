import os


class ChartEngine:
    def __init__(self, input_path, *, spark):
        self._csv_path = self._get_file_paths(input_path)
        self._spark = spark

    def read(self, single_csv_path):
        self._spark.read.csv(single_csv_path, header=True)

    def _get_file_paths(self, csv_path):
        file_paths = [f for f in os.listdir(csv_path) if f.endswith('.csv')]
        return file_paths

    def run(self):
        pass
