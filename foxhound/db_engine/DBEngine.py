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
    Zone, TenantIPAddressInfo,
    TenantApplicationInfo,
    ProcessedLogDetail
)
from .troubleticket_models import TroubleTicketRule
from .rule_models import Rule
TENANT_ID_DEFAULT = 1
SIZE_PER_LOG = 468


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
            ) if i not in dfs['core_ipaddress'].address.values
        ]
        destination_ip = [
            i for i in data['destination_ip_id'].unique(
            ) if i not in dfs['core_ipaddress'].address.values
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
            ) if i not in dfs['core_zone'].name.values
        ]
        destination_zone = [
            i for i in data['destination_zone_id'].unique(
            ) if i not in dfs['core_zone'].name.values
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
                f"INSERT INTO core_ipaddress VALUES({next_id}, '{i}', '{i}');")
            country_next_id = self._get_next_id('core_country')
            name, iso_code = self._get_country(i)
            self._db_engine.execute(
                f"INSERT INTO core_country VALUES({country_next_id}, '{name}', '{iso_code}', {next_id});"
            )

        for i in params['destination_ip']:
            print(f'Created Destination_IP: {i}')
            next_id = self._get_next_id('core_ipaddress')
            self._db_engine.execute(
                f"INSERT INTO core_ipaddress VALUES({next_id}, '{i}', '{i}');")

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
                f"INSERT INTO core_zone VALUES({next_id}, '{i}');")

        for i in params['destination_zone']:
            print(f'Created {i}')
            next_id = self._get_next_id('core_zone')
            self._db_engine.execute(
                f"INSERT INTO core_zone VALUES({next_id}, '{i}');")

        for i in params['firewall_rule']:
            print(f'Created {i}')
            next_id = self._get_next_id('core_firewallrule')
            self._db_engine.execute(
                f"INSERT INTO core_firewallrule VALUES({next_id}, '{i}', {TENANT_ID_DEFAULT});")

    def _map_to_foreign_key(self, data, dfs):
        data.virtual_system_id = data.virtual_system_id.map(
            dfs['core_virtualsystem'].reset_index().set_index('code').id)
        data.source_ip_id = data.source_ip_id.map(
            dfs['core_ipaddress'].drop_duplicates('address').reset_index().set_index('address').id)
        data.destination_ip_id = data.destination_ip_id.map(
            dfs['core_ipaddress'].drop_duplicates('address').reset_index().set_index('address').id)
        data.source_zone_id = data.source_zone_id.map(
            dfs['core_zone'].drop_duplicates('name').reset_index().set_index('name').id)
        data.destination_zone_id = data.destination_zone_id.map(
            dfs['core_zone'].drop_duplicates('name').reset_index().set_index('name').id)
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
            id = int(j.id)
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
                    verified_date_time=None,
                    is_anomalous_rule=False
                )
                self._session.add(rule)
                print(
                    f'Created Rule: {(source_ip)}--{destination_ip}--{application}'
                )
        self._session.commit()

    def _write_ip_info(self, id, data, ip_in_db):
        for date, ip_address in data:
            if ip_address not in ip_in_db:
                ip = TenantIPAddressInfo(
                    firewall_rule_id=id,
                    created_date=date,
                    ip_address=ip_address
                )
                self._session.add(ip)

    def _write_application_info(self, id,  data, application_in_db):
        for date, application in data:
            if application not in application_in_db:
                appl = TenantApplicationInfo(
                    firewall_rule_id=id,
                    created_date=date,
                    application=application
                )
                self._session.add(appl)

    def _write_info(self, data, traffic_log_id):
        ip_in_db = pd.read_sql_table(
            'core_tenantipaddressinfo',
            self._db_engine,
            index_col='id'
        ).ip_address.unique()
        application_in_db = pd.read_sql_table(
            'core_tenantapplicationinfo',
            self._db_engine,
            index_col='id'
        ).application.unique()
        # Write log info: size and row count
        firewall_rules = pd.read_sql_table(
            'core_firewallrule', self._db_engine)
        log_info = data[['firewall_rule_id', 'source_port']]
        log_info = log_info.groupby('firewall_rule_id').count().reset_index()
        log_info = pd.merge(
            log_info, firewall_rules,
            left_on='firewall_rule_id', right_on='name'
        )
        print(log_info.columns)
        #[['id', 'source_port']]
        for i, j in log_info.iterrows():
            processed_log_detail = ProcessedLogDetail(
                firewall_rule_id=int(j.id),
                log_id=int(traffic_log_id),
                n_rows=int(j.source_port),
                size=int(j.source_port*SIZE_PER_LOG)
            )
            self._session.add(processed_log_detail)
            self._session.commit()

        data.firewall_rule_id = data.firewall_rule_id.map(
            firewall_rules.reset_index().set_index('name').id)
        grouped = data.groupby('firewall_rule_id')
        for index, df in grouped:
            df.logged_datetime = pd.to_datetime(
                df.logged_datetime).map(lambda x: x.date())
            source = df[['logged_datetime', 'source_ip_id']].drop_duplicates()
            source.columns = ['logged_datetime', 'ip']
            destination = df[['logged_datetime',
                              'destination_ip_id']].drop_duplicates()
            destination.columns = ['logged_datetime', 'ip']
            ip = pd.concat([source, destination]).drop_duplicates().values
            application = df[['logged_datetime', 'application_id']
                             ].drop_duplicates().values
            self._write_ip_info(index, ip, ip_in_db)
            self._write_application_info(index, application, application_in_db)
        self._session.commit()

    def _write_to_db(self, csv: str):
        data = self._read_csv(csv)
        _data = data.copy()
        dfs = self._read_tables_from_db()
        params = self._get_unique(data, dfs)
        self._write_new_items_to_db(params)
        dfs = self._read_tables_from_db()
        self._map_to_foreign_key(data, dfs)
        traffic_log_id = self._write_traffic_log(csv)
        self._write_traffic_log_detail(data, traffic_log_id)
        self._write_rules(_data)
        self._write_info(_data, traffic_log_id)

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
            os.remove(csv)

    def _check_data_dir_valid(self, data_dir: str):
        if not os.path.isdir(data_dir):
            raise FileNotFoundError('Directory does not exist: ' + data_dir)

    def clean(self):
        BASE_QUERY = self._session.query(Rule).join(FirewallRule).filter(
            FirewallRule.tenant_id == 2
        )

        for rule in BASE_QUERY.filter(Rule.name.like('%*%')):
            # Fully generic fields are stored as .* in db
            # So, we need to replace .* with %
            # Further if fields are not fully generic
            # We need to replace * with %
            source_ip = rule.source_ip.replace('.*', '%').replace('*', '%')
            destination_ip = rule.destination_ip.replace(
                '.*', '%').replace('*', '%')
            application = rule.application.replace('.*', '%').replace('*', '%')
            for i in BASE_QUERY.filter(
                Rule.id != rule.id,  # Do not get current item
                Rule.source_ip.like(source_ip),
                Rule.destination_ip.like(destination_ip),
                Rule.application.like(application)
            ):
                print(i, 'deleted!')
                self._session.delete(i)
            self._session.commit()
