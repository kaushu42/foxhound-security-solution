from abc import ABC, abstractmethod
import csv
import os

import pandas as pd


class Engine(ABC):

    def __init__(
        self,
        input_path: str,
        log_detail_output_path: str,
        log_granular_hour_output_path: str
    ):
        if (
            isinstance(input_path, str) and
            isinstance(log_detail_output_path, str) and
            isinstance(log_granular_hour_output_path, str)
        ):
            self._INPUT_PATH = input_path
            self._LOG_DETAIL_OUTPUT_PATH = log_detail_output_path
            self._LOG_GRANULAR_HOUR_OUTPUT_PATH = log_granular_hour_output_path
        else:
            raise TypeError(
                "input_path and output_paths must be str instances"
            )
        self._check_data_dirs_valid()
        self._DATA_FIELDS = (
            'virtual_system_id',
            'source_ip_id', 'source_port',
            'destination_ip_id', 'destination_port',
            'bytes_sent', 'bytes_received', 'repeat_count',
            'application_id', 'packets_received', 'packets_sent',
            'protocol_id', 'time_elapsed',
            'source_zone_id', 'destination_zone_id',
            'firewall_rule_id', 'logged_datetime'
        )

        self._INPUT_TO_OUTPUT_MAP = {}

        self._input_csvs = self.get_input_csv_paths()
        self._output_csvs = self.get_output_csv_paths()

    @abstractmethod
    def _process(self, data: pd.DataFrame):
        pass

    @abstractmethod
    def _granularize(self, data: pd.DataFrame):
        pass

    def _check_data_dirs_valid(self):
        self._check_data_dir_valid(self._INPUT_PATH, directory_type='Input')
        self._check_data_dir_valid(
            self._LOG_DETAIL_OUTPUT_PATH, directory_type='Output')
        return True

    def _check_data_dir_valid(self, data_dir: str, directory_type: str):
        if not os.path.isdir(data_dir):
            raise FileNotFoundError(
                directory_type + ' directory does not exist: ' + data_dir)

    def get_input_csv_paths(self):
        return self._get_csv_paths(self._INPUT_PATH)

    def get_output_csv_paths(self):
        return self._get_csv_paths(self._LOG_DETAIL_OUTPUT_PATH)

    def _get_csv_paths(self, path: str):
        files = os.listdir(path)
        csvs = [os.path.join(path, f) for f in files if f.endswith('.csv')]
        return sorted(csvs)

    def _read_csv(self, csv_path: str):
        return pd.read_csv(csv_path)

    def _dump(self, input_filename: str, data: pd.DataFrame, output_dir):
        filename = input_filename.split('/')[-1]
        data.index.name = 'row_number'
        output_filename = os.path.join(output_dir, filename)
        data.to_csv(output_filename, index=True)
        print(f'\tWritten to {output_filename}')

    def _run_one(self, csv_path: str):
        data = self._read_csv(csv_path)
        log_detail = self._process(data)
        log_detail_granular_hour = self._granularize(data)
        self._dump(
            csv_path,
            log_detail,
            self._LOG_DETAIL_OUTPUT_PATH
        )
        self._dump(
            csv_path,
            log_detail_granular_hour,
            self._LOG_GRANULAR_HOUR_OUTPUT_PATH
        )
        # os.remove(csv_path)
        print(f'Log file at {csv_path} deleted.')

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
