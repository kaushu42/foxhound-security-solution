from abc import ABC, abstractmethod
import csv
import os

import pandas as pd


class Engine(ABC):

    def __init__(self, input_path: str, output_path: str):
        if isinstance(input_path, str) and isinstance(output_path, str):
            self._INPUT_PATH = input_path
            self._OUTPUT_PATH = output_path
        else:
            raise TypeError(
                "input_path and output_paths must be str instances"
            )
        self._check_data_dirs_valid()
        self._DATA_FIELDS = (
            'virtual_system',
            'source_ip', 'source_port',
            'destination_ip', 'destination_port',
            'bytes_sent', 'bytes_received', 'repeat_count',
            'application', 'packets_received', 'packets_sent',
            'ip_protocol', 'time_elapsed'
        )

        self._INPUT_TO_OUTPUT_MAP = {}

        self._csvs = self.get_csv_paths()

    @abstractmethod
    def _process(self, data: pd.DataFrame):
        pass

    def _check_data_dirs_valid(self):
        self._check_data_dir_valid(self._INPUT_PATH)
        self._check_data_dir_valid(self._OUTPUT_PATH)
        return True

    def _check_data_dir_valid(self, data_dir: str):
        if not os.path.isdir(data_dir):
            raise FileNotFoundError('Directory does not exist: ' + data_dir)

    def get_csv_paths(self):
        files = os.listdir(self._INPUT_PATH)
        csvs = [os.path.join(self._INPUT_PATH, f) for f in files]
        return csvs

    def _read_csv(self, csv_path: str):
        return pd.read_csv(csv_path)

    def _dump(self, input_filename: str, processed_data: pd.DataFrame):
        filename = input_filename.split('/')[-1]
        output_filename = self._OUTPUT_PATH + '/OUTPUT_' + filename
        processed_data.to_csv(output_filename)

    def _run_for_one(self, csv):
        data = self._read_csv(csv)
        data = self._process(data)
        self._dump(csv, data)

    def run(self):
        for csv in self._csvs:
            self._run_for_one(csv)
            break
