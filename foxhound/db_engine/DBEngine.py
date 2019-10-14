import os
from sqlalchemy import create_engine
import pandas as pd


class DBEngine(object):
    def __init__(self, input_dir: str):
        if not isinstance(input_dir, str):
            raise TypeError('Input_dir must be a string')
        self._INPUT_DIR = input_dir
        self._check_data_dir_valid(self._INPUT_DIR)
        self._csvs = self._get_csv_paths(self._INPUT_DIR)

    def _read_csv(self, csv: str):
        df = pd.read_csv(csv)
        return df

    def _write_to_db(self, csv: str, *, table_name: str):

        DB_ENGINE = create_engine(
            'postgresql://foxhounduser:foxhound123@localhost:5432/foxhounddb'
        )

        data = self._read_csv(csv)
        data.index.name = 'id'
        data.to_sql(table_name, DB_ENGINE, if_exists='append', index=False)

    def _get_csv_paths(self, path: str):
        files = os.listdir(path)
        csvs = [os.path.join(path, f) for f in files if f.endswith('.csv')]
        return csvs

    def run(self, verbose=False, *, table_name: str):
        for csv in self._csvs:
            if verbose:
                print('Writing to db: ', csv)
            self._write_to_db(csv, table_name=table_name)

    def _check_data_dir_valid(self, data_dir: str):
        if not os.path.isdir(data_dir):
            raise FileNotFoundError('Directory does not exist: ' + data_dir)
