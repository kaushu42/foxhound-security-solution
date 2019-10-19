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
            'virtual_system_id',
            'source_ip', 'source_port',
            'destination_ip', 'destination_port',
            'bytes_sent', 'bytes_received', 'repeat_count',
            'application', 'packets_received', 'packets_sent',
            'protocol', 'time_elapsed',
            'source_zone', 'destination_zone',
            'firewall_rule',
        )

        self._INPUT_TO_OUTPUT_MAP = {}

        self._input_csvs = self.get_input_csv_paths()
        self._output_csvs = self.get_output_csv_paths()

    @abstractmethod
    def _process(self, data: pd.DataFrame):
        pass

    def _check_data_dirs_valid(self):
        self._check_data_dir_valid(self._INPUT_PATH, directory_type='Input')
        self._check_data_dir_valid(self._OUTPUT_PATH, directory_type='Output')
        return True

    def _check_data_dir_valid(self, data_dir: str, directory_type: str):
        if not os.path.isdir(data_dir):
            raise FileNotFoundError(
                directory_type + ' directory does not exist: ' + data_dir)

    def get_input_csv_paths(self):
        return self._get_csv_paths(self._INPUT_PATH)

    def get_output_csv_paths(self):
        return self._get_csv_paths(self._OUTPUT_PATH)

    def _get_csv_paths(self, path: str):
        files = os.listdir(path)
        csvs = [os.path.join(path, f) for f in files if f.endswith('.csv')]
        return sorted(csvs)

    def _read_csv(self, csv_path: str):
        return pd.read_csv(csv_path)

    def _dump(self, input_filename: str, processed_data: pd.DataFrame):
        filename = input_filename.split('/')[-1]

        # Get all unique vsys ids
        vsys_list = processed_data['virtual_system_id'].unique()

        for vsys in vsys_list:
            f = filename.split('.')[0]
            output_filename = self._OUTPUT_PATH + f'/{f}_{vsys}.csv'
            data = processed_data[processed_data['virtual_system_id'] == vsys]
            data.to_csv(output_filename, index=False)
            print(f'\tWritten to {output_filename}')

    def _run_one(self, csv_path: str):
        data = self._read_csv(csv_path)
        data = self._process(data)
        self._dump(csv_path, data)

    def run(self, verbose=False):
        self._run(self._run_one, self._input_csvs, verbose=verbose)

    def _delete_one(self, csv_path: str):
        print(csv_path)

    def _delete_csv_files(self, verbose=False):
        self._run(lambda x: x, self._output_csvs,
                  verbose=verbose, message='Deleted:')

    def _run(self, callback, csvs, verbose=False, message='Processing:'):
        for csv in csvs:
            if verbose:
                print(message, csv)
            callback(csv)