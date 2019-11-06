import os
import re
import datetime

import sqlalchemy
from sqlalchemy.orm import sessionmaker

import pandas as pd

from tqdm import tqdm

import geoip2.database
import geoip2.errors

from .core_models import (
    VirtualSystem, TrafficLog,
    TrafficLogDetail, Country,
    IPAddress, FirewallRule,
    Tenant, Application, Protocol,
    Zone
)

TENANT_ID_DEFAULT = 1


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
        self._session = sessionmaker(bind=db_engine, autoflush=False)()
        self._reader = geoip2.database.Reader('./GeoLite2-City.mmdb')

    def _read_csv(self, csv: str):
        df = pd.read_csv(csv, index_col='row_number')
        return df

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
        ip_addresses = set()
        [ip_addresses.add(i) for i in data['source_ip'].unique()]
        [ip_addresses.add(i) for i in data['destination_ip'].unique()]

        for ip in ip_addresses:
            ip_exists_in_db = session.query(IPAddress).filter_by(
                address=ip).scalar() is not None
            if not ip_exists_in_db:
                print(ip)
                ip_address = IPAddress(address=ip)
                print('ip not in db')
                # session.add(ip_address)
                # session.flush()
            else:
                print('Item in db')
            exit(1)
            if session.query(Country).filter_by(ip_address=ip).scalar():
                continue
            ip_country = Country(ip_address_id=ip_address.id)
            country_name = ''
            country_iso_code = ''
            try:
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
            except geoip2.errors.AddressNotFoundError:
                country_name = 'Unknown'
                country_iso_code = '---'

            ip_country.country_name = country_name
            ip_country.country_iso_code = country_iso_code.lower()
            session.add(ip_country)
        session.flush()
        session.commit()

    def _get_traffic_log(self, csv, tenant_id):
        query = {
            'tenant_id': tenant_id,
            'processed_datetime': datetime.datetime.now(),
            'log_date': self._get_date(csv),
            'log_name': self._get_filename(csv)
        }
        traffic_log = TrafficLog(**query)
        self._session.add(traffic_log)
        self._session.flush()
        return traffic_log

    def _get_virtual_system(self, index, data):
        vsys_code = data.at[index, 'virtual_system_id']
        vsys = self._session.query(VirtualSystem).filter_by(code=vsys_code)
        if vsys.count() == 0:
            vsys = VirtualSystem(code=vsys_code, name=vsys_code)
            self._session.add(vsys)
            # self._session.flush()
        else:
            assert(vsys.count() == 1)
            vsys = vsys[0]
        return vsys

    def _get_firewall_rule(self, index, data):
        firewall_rule_name = data.at[index, 'firewall_rule']
        firewall_rule = self._session.query(
            FirewallRule).filter_by(name=firewall_rule_name)
        if firewall_rule.count() == 0:
            firewall_rule = FirewallRule(
                name=firewall_rule_name, tenant_id=TENANT_ID_DEFAULT)
            self._session.add(firewall_rule)
            # self._session.flush()
        else:
            assert(firewall_rule.count() == 1)
            firewall_rule = firewall_rule[0]

        return firewall_rule

    def _get_ip(self, index, data, type):
        if type == 0:
            col_name = 'source_ip'
        else:
            col_name = 'destination_ip'
        ip_name = data.at[index, col_name]
        ip = self._session.query(
            IPAddress).filter_by(address=ip_name, type=bool(type))
        if ip.count() == 0:
            ip = IPAddress(address=ip_name, type=type)
            self._session.add(ip)
            # self._session.flush()
        else:
            assert(ip.count() == 1)
            ip = ip[0]

        return ip

    def _get_application(self, index, data):
        application_name = data.at[index, 'application']
        application = self._session.query(
            Application).filter_by(name=application_name)
        if application.count() == 0:
            application = Application(name=application_name)
            self._session.add(application)
            # self._session.flush()
        else:
            assert(application.count() == 1)
            application = application[0]
        return application

    def _get_protocol(self, index, data):
        protocol_name = data.at[index, 'protocol']
        protocol = self._session.query(
            Protocol).filter_by(name=protocol_name)
        if protocol.count() == 0:
            protocol = Protocol(name=protocol_name)
            self._session.add(protocol)
            # self._session.flush()
        else:
            assert(protocol.count() == 1)
            protocol = protocol[0]
        return protocol

    def _get_zone(self, index, data, type, firewall_rule):
        if type == 0:
            zone_name = data.at[index, 'source_zone']
        else:
            zone_name = data.at[index, 'destination_zone']

        zone = self._session.query(
            Zone).filter_by(name=zone_name, type=bool(type))
        if zone.count() == 0:
            zone = Zone(name=zone_name,
                        firewall_rule_id=firewall_rule.id, type=type)
            self._session.add(zone)
            # self._session.flush()
        else:
            assert(zone.count() == 1)
            zone = zone[0]

        return zone

    def _get_params(self, index, data):
        return {
            'source_port': int(data.at[index, 'source_port']),
            'destination_port': int(data.at[index, 'destination_port']),
            'bytes_sent': int(data.at[index, 'bytes_sent']),
            'bytes_received': int(data.at[index, 'bytes_received']),
            'packets_sent': int(data.at[index, 'packets_sent']),
            'packets_received': int(data.at[index, 'packets_received']),
            'time_elapsed': int(data.at[index, 'time_elapsed']),
            'repeat_count': int(data.at[index, 'repeat_count']),
            'logged_datetime': data.at[index, 'logged_datetime']
        }

    def _write_to_db(self, csv: str):
        data = self._read_csv(csv)

        # Get the tenant id using firewall rule
        # We need to write the data into the database rowwise
        traffic_log_created = False
        for index in tqdm(data.index):
            # for index, row in tqdm(data.iterrows(), total=len(data.index)):
            params = self._get_params(index, data)
            virtual_system = self._get_virtual_system(index, data)
            firewall_rule = self._get_firewall_rule(index, data)
            source_ip = self._get_ip(index, data, 0)
            destination_ip = self._get_ip(index, data, 1)
            application = self._get_application(index, data)
            protocol = self._get_protocol(index, data)
            self._session.flush()
            source_zone = self._get_zone(index, data, 0, firewall_rule)
            destination_zone = self._get_zone(index, data, 1, firewall_rule)
            self._session.flush()
            if not traffic_log_created:
                traffic_log = self._get_traffic_log(
                    csv, firewall_rule.tenant_id)
                traffic_log_created = True

            traffic_log_detail = TrafficLogDetail(
                traffic_log_id=traffic_log.id,
                firewall_rule_id=firewall_rule.id,
                source_ip_id=source_ip.id,
                destination_ip_id=destination_ip.id,
                application_id=application.id,
                protocol_id=protocol.id,
                source_zone_id=source_zone.id,
                destination_zone_id=destination_zone.id,
                row_number=index,
                **params
            )
            self._session.add(traffic_log_detail)
            # Now we have the new firewall_rule id
        self._session.commit()
        # Create a TrafficLog object
        # Create a TrafficLogDetail object
        # Write the country data as well

        # self._write_country(data, session)

        # Get the virtual system id from database
        # vsys = self._get_virtual_system(data, session)

        # Use the key to write the data into the core_trafficlog table
        # traffic_log = self._get_traffic_log(csv, vsys, session)

        # Write to the core_trafficlogdetail using the obtained traffic_log id

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
