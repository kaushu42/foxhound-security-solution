import os
import re
import datetime

import sqlalchemy
from sqlalchemy.orm import sessionmaker

import pandas as pd

import geoip2.database


from .core_models import (VirtualSystem, TrafficLog,
                          TrafficLogDetail, IPCountry)


class DBEngine(object):
    def __init__(self, input_dir: str, *, db_engine):
        if not isinstance(input_dir, str):
            raise TypeError('Input_dir must be a string')

        if not isinstance(db_engine, sqlalchemy.engine.base.Engine):
            raise TypeError('db_engine must be an sqlalchemy engine instance')

        self._INPUT_DIR = input_dir
        self._db_engine = db_engine
        self._check_data_dir_valid(self._INPUT_DIR)
        self._csvs = self._get_csv_paths(self._INPUT_DIR)
        self._session = sessionmaker(bind=db_engine)
        self._reader = geoip2.database.Reader('./GeoLite2-City.mmdb')

    def _read_csv(self, csv: str):
        df = pd.read_csv(csv)
        return df

    def _get_virtual_system(self, data, session):
        # data should have only 1 virtual system
        vsys = data['virtual_system_id'].unique()
        assert(len(vsys) == 1)
        vsys = session.query(VirtualSystem).filter_by(code=vsys[0])[0]
        return vsys

    def _get_traffic_log(self, csv, vsys, session):
        query = {
            'virtual_system_id': vsys.id,
            'processed_datetime': datetime.datetime.now(),
            'log_date': self._get_date(csv),
            'log_name': self._get_filename(csv)
        }

        traffic_log = TrafficLog(**query)

        # Flush changes to db to get the newly inserted id
        session.add(traffic_log)
        session.flush()
        session.commit()
        return traffic_log

    def _write_to_traffic_log_detail(self, data, traffic_log):
        data.rename(
            columns={
                'virtual_system_id': 'traffic_log_id'
            },
            inplace=True
        )
        data['traffic_log_id'] = traffic_log.id
        data.to_sql(
            TrafficLogDetail.__tablename__,
            self._db_engine,
            if_exists='append',
            index=False
        )

    def _is_ip_private(self, ip):
        if (
            ip.startswith('192.168.') or
            ip.startswith('10.') or
            ip.startswith('172.16') or
            ip.startswith('172.17') or
            ip.startswith('172.18') or
            ip.startswith('172.19') or
            ip.startswith('172.2') or
            ip.startswith('172.30.') or
            ip.startswith('172.31.')
        ):
            return True
        return False

    def _write_country(self, data, session):
        ips = set()
        [ips.add(i) for i in data['source_ip'].unique()]
        [ips.add(i) for i in data['destination_ip'].unique()]

        for ip in ips:
            if session.query(IPCountry).filter_by(ip=ip).scalar():
                continue
            ip_country = IPCountry(ip=ip)
            country_name = ''
            country_iso_code = ''
            if self._is_ip_private(ip) is not True:
                country = self._reader.city(ip).country
                country_iso_code = country.iso_code
                country_name = country.name
                if country_iso_code is None:
                    country_name = 'Unknown'
                    country_iso_code = '---'
            else:
                country_iso_code = "np"
                country_name = "Nepal"
            ip_country.country_name = country_name
            ip_country.country_iso_code = country_iso_code.lower()
            session.add(ip_country)
        session.flush()
        session.commit()

    def _write_to_db(self, csv: str):
        data = self._read_csv(csv)

        session = self._session()

        self._write_country(data, session)

        # Get the virtual system id from database
        vsys = self._get_virtual_system(data, session)

        # Use the key to write the data into the core_trafficlog table
        traffic_log = self._get_traffic_log(csv, vsys, session)

        # Write to the core_trafficlogdetail using the obtained traffic_log id
        self._write_to_traffic_log_detail(data, traffic_log)

    def _get_filename(self, string):
        processed_filename = string.split('/')[-1]
        filename = processed_filename.split('_vsys')[0] + '.csv'
        return filename

    def _get_date(self, string):
        date = re.findall(r'[0-9]{4}_[0-9]{2}_[0-9]{2}',
                          string)[0].replace('_', '-')
        return date

    def _add_date_column(self, data, csv):

        data['date'] = pd.to_datetime(date)

    def _get_csv_paths(self, path: str):
        files = os.listdir(path)
        csvs = [os.path.join(path, f) for f in files if f.endswith('.csv')]
        return sorted(csvs)

    def run(self, verbose=False):
        for csv in self._csvs:
            if verbose:
                print('Writing to db: ', csv)
            self._write_to_db(csv)

    def _check_data_dir_valid(self, data_dir: str):
        if not os.path.isdir(data_dir):
            raise FileNotFoundError('Directory does not exist: ' + data_dir)
