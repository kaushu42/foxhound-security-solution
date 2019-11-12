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
from .troubleticket_models import TroubleTicketRule
from .rule_models import Rule
TENANT_ID_DEFAULT = 1


class DBEngine(object):
    def __init__(self, input_dir: str, *, db_engine, db_path):
        if not isinstance(input_dir, str):
            raise TypeError('Input_dir must be a string')

        if not isinstance(db_engine, sqlalchemy.engine.base.Engine):
            raise TypeError('db_engine must be an sqlalchemy engine instance')

        self._INPUT_DIR = input_dir
        self._db_engine = db_engine
        self._check_data_dir_valid(self._INPUT_DIR)
        self._csvs = self._get_csv_paths(self._INPUT_DIR)
        self._session = sessionmaker(bind=db_engine, autoflush=False)()
        self._reader = geoip2.database.Reader(db_path)
        self._cols = [
            'core_virtualsystem',
            'core_tenant',
            'core_firewallrule',
            'core_domain',
            'core_ipaddress',
            'core_application',
            'core_protocol',
            'core_zone',
            'core_firewallrulezone'
        ]

    def _read_csv(self, csv: str):
        df = pd.read_csv(csv, index_col='row_number')
        return df

    def _get_table(self, table_name):
        table = pd.read_sql_table(table_name, self._db_engine, index_col='id')
        return table

    def _get_next_id(self, col_name):
        return self._session.execute(
            f"select nextval('{col_name}_id_seq');"
        ).fetchone()[0]

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

    def _read_tables_from_db(self):
        dfs = {}
        for col in self._cols:
            dfs[col] = self._get_table(col)
        return dfs

    def _get_unique(self, data, dfs):
        vsys = [
            i for i in data['virtual_system_id'].unique(
            ) if i not in dfs['core_virtualsystem'].code.values
        ]
        firewall_rule = [
            i for i in data['firewall_rule_id'].unique(
            ) if i not in dfs['core_firewallrule'].name.values
        ]
        source_ip = [
            i for i in data['source_ip_id'].unique(
            ) if i not in dfs['core_ipaddress'][dfs['core_ipaddress'].type == False].address.values
        ]
        destination_ip = [
            i for i in data['destination_ip_id'].unique(
            ) if i not in dfs['core_ipaddress'][dfs['core_ipaddress'].type == True].address.values
        ]
        application = [
            i for i in data['application_id'].unique(
            ) if i not in dfs['core_application'].name.values
        ]
        protocol = [
            i for i in data['protocol_id'].unique(
            ) if i not in dfs['core_protocol'].name.values
        ]
        source_zone = [
            i for i in data['source_zone_id'].unique(
            ) if i not in dfs['core_zone'][dfs['core_zone'].type == False].name.values
        ]
        destination_zone = [
            i for i in data['destination_zone_id'].unique(
            ) if i not in dfs['core_zone'][dfs['core_zone'].type == True].name.values
        ]
        return {
            'vsys': vsys,
            'firewall_rule': firewall_rule,
            'source_ip': source_ip,
            'destination_ip': destination_ip,
            'application': application,
            'protocol': protocol,
            'source_zone': source_zone,
            'destination_zone': destination_zone,
        }

    def _get_country(self, ip_address):
        if self._is_ip_private(ip_address):
            return 'Nepal', 'np'
        try:
            info = self._reader.city(ip_address).country
            if info.name is None:
                raise geoip2.errors.AddressNotFoundError
        except geoip2.errors.AddressNotFoundError:
            print('Not in database')
            return 'Unknown', '---'
        return info.name.lower(), info.iso_code.lower()

    def _write_new_items_to_db(self, params):
        for v in params['vsys']:
            print(f'Created {v}')
            next_id = self._get_next_id('core_virtualsystem')
            self._db_engine.execute(
                f"INSERT INTO core_virtualsystem VALUES({next_id}, '{v}', '{v}');")

        for i in params['source_ip']:
            print(f'Created Source_IP: {i}')
            next_id = self._get_next_id('core_ipaddress')
            self._db_engine.execute(
                f"INSERT INTO core_ipaddress VALUES({next_id}, '{i}', false);")
            country_next_id = self._get_next_id('core_country')
            name, iso_code = self._get_country(i)
            self._db_engine.execute(
                f"INSERT INTO core_country VALUES({country_next_id}, '{name}', '{iso_code}', {next_id});"
            )

        for i in params['destination_ip']:
            print(f'Created Destination_IP: {i}')
            next_id = self._get_next_id('core_ipaddress')
            self._db_engine.execute(
                f"INSERT INTO core_ipaddress VALUES({next_id}, '{i}', true);")

        for i in params['protocol']:
            print(f'Created {i}')
            next_id = self._get_next_id('core_protocol')
            self._db_engine.execute(
                f"INSERT INTO core_protocol VALUES({next_id}, '{i}');")

        for i in params['application']:
            print(f'Created {i}')
            next_id = self._get_next_id('core_application')
            self._db_engine.execute(
                f"INSERT INTO core_application VALUES({next_id}, '{i}');")

        for i in params['source_zone']:
            print(f'Created {i}')
            next_id = self._get_next_id('core_zone')
            self._db_engine.execute(
                f"INSERT INTO core_zone VALUES({next_id}, '{i}', false);")

        for i in params['destination_zone']:
            print(f'Created {i}')
            next_id = self._get_next_id('core_zone')
            self._db_engine.execute(
                f"INSERT INTO core_zone VALUES({next_id}, '{i}', true);")

        for i in params['firewall_rule']:
            print(f'Created {i}')
            next_id = self._get_next_id('core_firewallrule')
            self._db_engine.execute(
                f"INSERT INTO core_firewallrule VALUES({next_id}, '{i}', {TENANT_ID_DEFAULT});")

    def _map_to_foreign_key(self, data, dfs):
        data.virtual_system_id = data.virtual_system_id.map(
            dfs['core_virtualsystem'].reset_index().set_index('code').id)
        data.source_ip_id = data.source_ip_id.map(
            dfs['core_ipaddress'][dfs['core_ipaddress'].type == False].reset_index().set_index('address').id)
        data.destination_ip_id = data.destination_ip_id.map(
            dfs['core_ipaddress'][dfs['core_ipaddress'].type == True].reset_index().set_index('address').id)
        data.source_zone_id = data.source_zone_id.map(
            dfs['core_zone'][dfs['core_zone'].type == False].reset_index().set_index('name').id)
        data.destination_zone_id = data.destination_zone_id.map(
            dfs['core_zone'][dfs['core_zone'].type == True].reset_index().set_index('name').id)
        data.application_id = data.application_id.map(
            dfs['core_application'].reset_index().set_index('name').id)
        data.protocol_id = data.protocol_id.map(
            dfs['core_protocol'].reset_index().set_index('name').id)
        data.firewall_rule_id = data.firewall_rule_id.map(
            dfs['core_firewallrule'].reset_index().set_index('name').id)

    def _get_filename_from_full_path(self, path):
        return path.split('/')[-1]

    def _write_traffic_log(self, filename):
        filename = self._get_filename_from_full_path(filename)
        log_date = self._get_date_from_filename(filename)
        traffic_log = TrafficLog(log_name=filename, log_date=log_date,
                                 processed_datetime=datetime.datetime.now())
        self._session.add(traffic_log)
        self._session.flush()
        self._session.commit()
        return traffic_log.id

    def _write_traffic_log_detail(self, data, traffic_log_id):
        data['traffic_log_id'] = traffic_log_id
        data.drop(['virtual_system_id'], axis=1).to_sql(
            'core_trafficlogdetail', self._db_engine, if_exists='append', index=True)

    def _write_rules(self, data):
        data = data[['firewall_rule_id', 'source_ip_id',
                     'destination_ip_id', 'application_id']].drop_duplicates()
        rules_table = pd.read_sql_table('rules_rule', self._db_engine)
        firewall_rules = pd.read_sql_table(
            'core_firewallrule', self._db_engine)
        data = pd.merge(
            data, firewall_rules,
            left_on='firewall_rule_id', right_on='name')[
            ['id', 'source_ip_id', 'destination_ip_id', 'application_id']
        ]
        for i, j in data.iterrows():
            id = j.id
            source_ip = j.source_ip_id
            destination_ip = j.destination_ip_id
            application = j.application_id
            rules = rules_table[
                (rules_table['source_ip'] == source_ip) &
                (rules_table['destination_ip'] == destination_ip) &
                (rules_table['application'] == application)
            ]
            if rules.index.empty:
                rule_name = f'{source_ip}--{destination_ip}--{application}'
                now = datetime.datetime.now()
                rule = Rule(
                    firewall_rule_id=id,
                    verified_by_user_id=None,
                    created_date_time=now,
                    name=rule_name,
                    source_ip=source_ip,
                    destination_ip=destination_ip,
                    application=application,
                    description='New Rule',
                    is_verified_rule=False,
                    verified_date_time=None
                )
                self._session.add(rule)
                # self._session.flush()
                # tt_rule = TroubleTicketRule(
                #     created_datetime=now,
                #     is_closed=False,
                #     rule_id=rule.id,
                # )
                # self._session.add(tt_rule)
                print(
                    f'Created Rule: {source_ip}--{destination_ip}--{application}')

        self._session.commit()

    def _write_to_db(self, csv: str):
        data = self._read_csv(csv)
        dfs = self._read_tables_from_db()
        params = self._get_unique(data, dfs)
        self._write_new_items_to_db(params)
        dfs = self._read_tables_from_db()
        self._map_to_foreign_key(data, dfs)
        traffic_log_id = self._write_traffic_log(csv)
        self._write_traffic_log_detail(data, traffic_log_id)
        self._write_rules(self._read_csv(csv))

    def _get_date_from_filename(self, string):
        date = re.findall(r'[0-9]{4}_[0-9]{2}_[0-9]{2}',
                          string)[0].replace('_', '-')
        return date

    def _get_csv_paths(self, path: str):
        files = os.listdir(path)
        csvs = [os.path.join(path, f) for f in files if f.endswith('.csv')]
        return sorted(csvs)

    def run(self, verbose=False):
        for csv in self._csvs:
            if verbose:
                print('Writing to db: ', csv)
            self._write_to_db(csv)
            # os.remove(csv)

    def _check_data_dir_valid(self, data_dir: str):
        if not os.path.isdir(data_dir):
            raise FileNotFoundError('Directory does not exist: ' + data_dir)
