import os
import re
import datetime
import enum
import math
from collections import defaultdict

import sqlalchemy
from sqlalchemy.orm import sessionmaker

import pandas as pd

import os
import subprocess
import datetime

import pandas as pd
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker
from pyspark.sql import SparkSession
from pyspark.sql.types import StructField, StructType, StringType, IntegerType, TimestampType
from pyspark.sql.functions import concat, col, lit, count


from tqdm import tqdm

import geoip2.database
import geoip2.errors

from .core_models import (
    VirtualSystem, TrafficLog,
    Country,
    IPAddress, FirewallRule,
    Tenant, Application, Protocol,
    Zone, TenantIPAddressInfo,
    TenantApplicationInfo,
    ProcessedLogDetail,
    Interface, Action, Category,
    SessionEndReason
)
from .troubleticket_models import TroubleTicketRule
from .rule_models import Rule
TENANT_ID_DEFAULT = 1
SIZE_PER_LOG = 468

FILL_NA_WITH = 'UNKNOWN_SESSION_END_REASON'
TMP_FILENAME = '/tmp/logdata.csv'


class LOG_TYPE(enum.IntEnum):
    DETAIL = 0
    GRANULAR_HOUR = 1


class DBEngine(object):

    def __init__(
            self,
            log_input_dir: str,
            granular_hour_input_dir: str,
            *, db_engine, db_path, spark_session, logging
    ):
        if not isinstance(log_input_dir, str):
            raise TypeError('Log input directory must be a string')

        if not isinstance(granular_hour_input_dir, str):
            raise TypeError('Granular input directory must be a string')

        if not isinstance(db_engine, sqlalchemy.engine.base.Engine):
            raise TypeError('db_engine must be an sqlalchemy engine instance')

        self.spark = spark_session
        self._LOG_DETAIL_INPUT_DIR = log_input_dir
        self._GRANULAR_HOUR_INPUT_DIR = granular_hour_input_dir

        self._db_engine = db_engine
        self._check_data_dir_valid(self._LOG_DETAIL_INPUT_DIR)
        self._check_data_dir_valid(self._GRANULAR_HOUR_INPUT_DIR)
        self._log_detail_csvs = self._get_csv_paths(self._LOG_DETAIL_INPUT_DIR)
        self._granular_hour_csvs = self._get_csv_paths(
            self._GRANULAR_HOUR_INPUT_DIR)
        self._session = sessionmaker(bind=db_engine, autoflush=False)()
        self._reader = geoip2.database.Reader(db_path)
        self.logging = logging
        self._cols = [
            'core_virtualsystem',
            'core_tenant',
            'core_trafficlog',
            'core_firewallrule',
            'core_domain',
            'core_ipaddress',
            'core_application',
            'core_protocol',
            'core_zone',
            'core_firewallrulezone',
            'core_interface',
            'core_category',
            'core_sessionendreason',
            'core_action'
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
        self.logging.info('Getting unique vsys...')
        new_items = data['virtual_system_id'].unique()
        old_items = set(dfs['core_virtualsystem'].code.values)
        vsys = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique firewall rule...')
        new_items = data['firewall_rule_id'].unique()
        old_items = set(dfs['core_firewallrule'].name.values)
        firewall_rule = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique source ips...')
        new_items = data['source_ip_id'].unique()
        old_items = set(dfs['core_ipaddress'].address.values)
        source_ip = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique destination ips...')
        new_items = data['destination_ip_id'].unique()
        old_items = set(dfs['core_ipaddress'].address.values)
        destination_ip = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique applications...')
        new_items = data['application_id'].unique()
        old_items = set(dfs['core_application'].name.values)
        application = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique protocols...')
        new_items = data['protocol_id'].unique()
        old_items = set(dfs['core_protocol'].name.values)
        protocol = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique source zones...')
        new_items = data['source_zone_id'].unique()
        old_items = set(dfs['core_zone'].name.values)
        source_zone = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique destination zones...')
        new_items = data['destination_zone_id'].unique()
        old_items = set(dfs['core_zone'].name.values)
        destination_zone = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique inbound interfaces...')
        new_items = data['inbound_interface_id'].unique()
        old_items = set(dfs['core_interface'].name.values)
        inbound_interface = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique outbound interfaces...')
        new_items = data['outbound_interface_id'].unique()
        old_items = set(dfs['core_interface'].name.values)
        outbound_interface = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique actions...')
        new_items = data['action_id'].unique()
        old_items = set(dfs['core_action'].name.values)
        action = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique categories...')
        new_items = data['category_id'].unique()
        old_items = set(dfs['core_category'].name.values)
        category = [
            i for i in new_items if i not in old_items
        ]
        self.logging.info('Getting unique season end reasons...')
        new_items = data['session_end_reason_id'].unique()
        old_items = set(dfs['core_sessionendreason'].name.values)
        session_end_reason = [
            i for i in new_items if i not in old_items
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
            'inbound_interface': inbound_interface,
            'outbound_interface': outbound_interface,
            'action': action,
            'category': category,
            'session_end_reason': session_end_reason,
        }

    def _get_country(self, ip_address):
        if self._is_ip_private(ip_address):
            return 'Nepal', 'np'
        try:
            info = self._reader.city(ip_address).country
            if info.name is None:
                raise geoip2.errors.AddressNotFoundError
        except geoip2.errors.AddressNotFoundError:
            self.logging.info('Not in database')
            return 'Unknown', '---'
        return info.name.lower(), info.iso_code.lower()

    def _write_new_items_to_db(self, params, verbose=False):
        print('******Virtual System******')
        for i in params['vsys']:
            if verbose:
                print(f'Created {i}')
            item = VirtualSystem(code=i, name=i)
            self._session.add(item)
        self._session.commit()

        print('******IP Address******')
        for i in params['source_ip']:
            if verbose:
                print(f'Created {i}')
            item = IPAddress(address=i)
            self._session.add(item)
            self._session.flush()
            name, iso_code = self._get_country(i)
            item = Country(ip_address_id=item.id, name=name, iso_code=iso_code)
            self._session.add(item)

        for i in params['destination_ip']:
            if verbose:
                print(f'Created {i}')
            item = IPAddress(address=i)
            self._session.add(item)
            self._session.flush()
            name, iso_code = self._get_country(i)
            item = Country(ip_address_id=item.id, name=name, iso_code=iso_code)
            self._session.add(item)
        self._session.commit()

        print('******Protocol******')
        for i in params['protocol']:
            if verbose:
                print(f'Created {i}')
            item = Protocol(name=i)
            self._session.add(item)
        self._session.commit()

        print('******Application******')
        for i in params['application']:
            if verbose:
                print(f'Created {i}')
            item = Application(name=i)
            self._session.add(item)
        self._session.commit()

        print('******Zone******')
        for i in params['source_zone']:
            if verbose:
                print(f'Created {i}')
            item = Zone(name=i)
            self._session.add(item)

        for i in params['destination_zone']:
            if verbose:
                print(f'Created {i}')
            item = Zone(name=i)
            self._session.add(item)
        self._session.commit()

        print('******Firewall Rule******')
        for i in params['firewall_rule']:
            if verbose:
                print(f'Created {i}')
            item = FirewallRule(name=i, tenant_id=TENANT_ID_DEFAULT)
            self._session.add(item)
        self._session.commit()

        print('******Interface******')
        for i in params['inbound_interface']:
            if verbose:
                print(f'Created {i}')
            item = Interface(name=i)
            self._session.add(item)

        for i in params['outbound_interface']:
            if verbose:
                print(f'Created {i}')
            item = Interface(name=i)
            self._session.add(item)
        self._session.commit()

        print('******Action******')
        for i in params['action']:
            if verbose:
                print(f'Created {i}')
            item = Action(name=i)
            self._session.add(item)
        self._session.commit()

        print('******Category******')
        for i in params['category']:
            if verbose:
                print(f'Created {i}')
            item = Category(name=i)
            self._session.add(item)
        self._session.commit()

        print('******Session End Reason******')
        for i in params['session_end_reason']:
            if verbose:
                print(f'Created {i}')
            try:
                math.isnan(i)
                name = FILL_NA_WITH
            except TypeError:
                name = i
            item = SessionEndReason(name=name)
            self._session.add(item)
        self._session.commit()

    def _map_to_foreign_key(self, data, dfs):
        # data = data.copy()
        data.virtual_system_id = data.virtual_system_id.map(
            dfs['core_virtualsystem'].drop_duplicates(
                'name').reset_index().set_index('code').id).astype(int)
        data.source_ip_id = data.source_ip_id.map(
            dfs['core_ipaddress'].drop_duplicates(
                'address').reset_index().set_index('address').id).astype(int)
        data.destination_ip_id = data.destination_ip_id.map(
            dfs['core_ipaddress'].drop_duplicates(
                'address').reset_index().set_index('address').id).astype(int)
        data.source_zone_id = data.source_zone_id.map(
            dfs['core_zone'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.destination_zone_id = data.destination_zone_id.map(
            dfs['core_zone'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.application_id = data.application_id.map(
            dfs['core_application'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.protocol_id = data.protocol_id.map(
            dfs['core_protocol'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.firewall_rule_id = data.firewall_rule_id.map(
            dfs['core_firewallrule'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.inbound_interface_id = data.inbound_interface_id.map(
            dfs['core_interface'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.outbound_interface_id = data.outbound_interface_id.map(
            dfs['core_interface'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.action_id = data.action_id.map(
            dfs['core_action'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.category_id = data.category_id.map(
            dfs['core_category'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        data.session_end_reason_id = data.session_end_reason_id.fillna(
            FILL_NA_WITH).map(
            dfs['core_sessionendreason'].drop_duplicates(
                'name').reset_index().set_index('name').id).astype(int)
        return data

    def _get_filename_from_full_path(self, path):
        return os.path.basename(path)

    def _write_traffic_log(self, log_name):
        log_date = self._get_date_from_filename(log_name)
        traffic_log = TrafficLog(log_name=log_name, log_date=log_date,
                                 processed_datetime=datetime.datetime.now())
        self._session.add(traffic_log)
        self._session.flush()
        self._session.commit()
        return traffic_log

    def _write_log(self, data, traffic_log_id, index=True, *, table_name):
        data['traffic_log_id'] = traffic_log_id
        data = data.drop(['virtual_system_id'], axis=1).reset_index()
        cols = [
            'row_number', 'source_port',
            'destination_port',
            'bytes_sent',
            'bytes_received',
            'repeat_count',
            'packets_received',
            'packets_sent',
            'time_elapsed',
            'logged_datetime',
            'action_id',
            'application_id',
            'category_id',
            'destination_ip_id',
            'destination_zone_id',
            'firewall_rule_id',
            'inbound_interface_id',
            'outbound_interface_id',
            'protocol_id',
            'session_end_reason_id',
            'source_ip_id',
            'source_zone_id',
            'traffic_log_id'
        ]
        if 'granular' in table_name:
            cols.remove('source_port')
            cols.remove('row_number')
        data = data[cols]
        data.to_csv(TMP_FILENAME, index=False)
        cursor = self._db_engine.raw_connection().cursor()
        with open(TMP_FILENAME) as f:
            next(f)
            cursor.copy_from(f, table_name, sep=',', columns=cols)
        cursor.connection.commit()
        os.remove(TMP_FILENAME)

    def _read_csv_spark(self, csv_path):
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f'{csv_path} does not exist.')
        return self.spark.read.csv(csv_path, header=True)

    def _write_rules(csv_path):
        filenames = self._get_csv_paths(csv_path)
        COLS = [
            'created_date_time', 'name', 'source_ip',
            'destination_ip', 'application', 'description',
            'is_verified_rule', 'is_anomalous_rule', 'verified_date_time',
            'firewall_rule_id', 'verified_by_user_id'
        ]

        # Get postgres cursor
        cursor = self._db_engine.raw_connection().cursor()

        # Write each rule csv to postgres
        for file in filenames:
            with open(file) as f:
                try:
                    next(f)  # Skip the header
                except StopIteration:
                    print(f'Empty file: {file}')
                cursor.copy_from(f, 'rules_rule', sep=',', columns=COLS)
            cursor.connection.commit()

    def _write_ip_info(self, id, data, ip_in_db):
        for date, ip_address in data:
            if ip_address not in ip_in_db:
                ip = TenantIPAddressInfo(
                    firewall_rule_id=id,
                    created_date=date,
                    address=ip_address
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

    def isin(self, df, fieldname):
        return df.__getattr__(fieldname).isin

    def _write_info_to_csv(self):
        self._write_ip_info_to_csv('source')
        self._write_ip_info_to_csv('destination')
        self._write_application_info_to_csv('application')

    def _write_application_info_to_csv(self, type='application'):
        df = self.spark.read.csv(f'/tmp/{type}.csv', header=True).toPandas()
        df.rename(columns={'logged_datetime': 'created_date',
                           'id': 'firewall_rule_id', 'application_id': 'application'}, inplace=True)
        df.created_date = df.created_date.apply(lambda x: x.split()[0])
        df.to_csv(f'/tmp/_{type}.csv', index=False)

    def _write_ip_info_to_csv(self, type):
        df = self.spark.read.csv(f'/tmp/{type}.csv', header=True).toPandas()
        df.rename(columns={'logged_datetime': 'created_date',
                           'id': 'firewall_rule_id'}, inplace=True)
        df.created_date = df.created_date.apply(lambda x: x.split()[0])
        df['alias'] = df['address']
        df.to_csv(f'/tmp/_{type}.csv', index=False)

    @staticmethod
    def write_log_detail_for_row(row, traffic_log_id):
        # Save the object to db here DO NOT COMMIT, COMMIT AT LAST
        with open('/tmp/processedlogdetails.csv', 'w') as f:
            f.write(f'{row.id},{log_id},{n_rows},{size}\n')
        processed_log_detail = ProcessedLogDetail(
            firewall_rule_id={row.id},
            log_id={traffic_log_id},
            n_rows={row.total},
            size={row.total*468}
        )
        return processed_log_detail

    def _get_group_uniques(self, df, get_field, group_field='firewall_rule_id'):
        FROM_DB = defaultdict(set)
        grouped = df.groupby(group_field)
        for group_field_name, data in grouped:
            FROM_DB[group_field_name] = set(
                data.__getattr__(get_field).unique()
            )
        return FROM_DB

    def _write_info_to_db(self):
        IP_COLS = 'created_date,address,firewall_rule_id,alias'.split(',')
        APPLICATION_COLS = 'created_date,application,firewall_rule_id'.split(
            ',')
        names = [
            (
                '/tmp/_source.csv',
                'core_tenantipaddressinfo',
                IP_COLS
            ),
            (
                '/tmp/_destination.csv',
                'core_tenantipaddressinfo',
                IP_COLS
            ),
            (
                '/tmp/_application.csv',
                'core_tenantapplicationinfo',
                APPLICATION_COLS
            )
        ]
        cursor = self._db_engine.raw_connection().cursor()
        for filename, table_name, cols in names:
            with open(filename) as f:
                try:
                    next(f)  # Skip the header
                except StopIteration:
                    print(f'Empty file: {file}')
                try:
                    cursor.copy_from(f, table_name, sep=',', columns=cols)
                except Exception as e:
                    print(filename, table_name, cols)
                    print(e)

            cursor.connection.commit()

    def _write_ip_and_application_info(self, df, field_name, items_in_db, firewall_rules, keep_fields, type):
        df = df.filter(~self.isin(df, field_name)(items_in_db))
        df = df.join(
            firewall_rules,
            on=[
                df.__getattr__('firewall_rule_id') == firewall_rules.name
            ]
        )[keep_fields]
        df.write.csv(f'/tmp/{type}.csv', header=True, mode='append')
        return df

    def _write_info(self, df, traffic_log_id):
        import findspark
        findspark.init()
        IP_SCHEMA = StructType([
            StructField('created_date', TimestampType()),
            StructField('address', StringType()),
            StructField('firewall_rule_id', IntegerType()),
            StructField('alias', StringType()),
        ])
        APPLICATION_SCHEMA = StructType([
            StructField('created_date', TimestampType()),
            StructField('application',
                        StringType()),
            StructField(
                'firewall_rule_id', IntegerType()),
        ])

        db_data = pd.read_sql_table(
            'core_tenantipaddressinfo',
            self._db_engine,
            index_col='id'
        )
        ip_in_db = self._get_group_uniques(db_data, 'address')

        db_data = pd.read_sql_table(
            'core_tenantapplicationinfo',
            self._db_engine,
            index_col='id'
        )
        application_in_db = self._get_group_uniques(db_data, 'application')

        # Get firewall rules from database
        FIREWALL_RULE_TABLE = 'core_firewallrule'
        firewall_rules = pd.read_sql_table(
            FIREWALL_RULE_TABLE, self._db_engine)
        firewall_rules_name_to_id = {
            i: j for i, j in firewall_rules[['name', 'id']].values}
        firewall_rules_id_to_name = {j: i for i,
                                     j in firewall_rules_name_to_id.items()}
        firewall_rules = self.spark.createDataFrame(firewall_rules.astype(str))

        log_info = df[['firewall_rule_id', 'source_port']
                      ].groupBy('firewall_rule_id')
        log_info = log_info.agg(count('source_port').alias("total"))
        log_info = log_info.join(
            firewall_rules,
            on=[
                log_info.firewall_rule_id == firewall_rules.name
            ]
        )
        # Apply function to df for saving the items to database
        # log_info.rdd.map(
        #     lambda x: DBEngine.write_log_detail_for_row(x, 100)
        # ).collect()
        log_info = log_info.toPandas()
        log_info['size'] = log_info['total'] * SIZE_PER_LOG
        log_info['log_id'] = traffic_log_id
        del log_info['firewall_rule_id']
        log_info.rename(columns={
            'total': 'n_rows',
            'id': 'firewall_rule_id'
        }, inplace=True)
        log_info = log_info[['n_rows', 'size', 'firewall_rule_id', 'log_id']]
        log_info.to_sql('core_processedlogdetail',
                        self._db_engine, if_exists='append',
                        index=False)

        data = df[['firewall_rule_id', 'source_ip_id',
                   'destination_ip_id', 'application_id', 'logged_datetime']]
        groups = [x[0]
                  for x in data.select("firewall_rule_id").distinct().collect()]

        header_name = ['logged_datetime', 'address', 'firewall_rule_id']
        for group in tqdm(groups):
            # Get the current group data
            group_data = data.filter(data.firewall_rule_id == group)

            # Get all unique items from the csv
            source = group_data.dropDuplicates(['firewall_rule_id', 'source_ip_id'])[
                'logged_datetime', 'source_ip_id', 'firewall_rule_id']
            source = source.toDF(*header_name)
            destination = group_data.dropDuplicates(['firewall_rule_id', 'destination_ip_id'])[
                'logged_datetime', 'destination_ip_id', 'firewall_rule_id']
            destination = destination.toDF(*header_name)
            application = group_data.dropDuplicates(['firewall_rule_id', 'application_id'])[
                'logged_datetime', 'application_id', 'firewall_rule_id']

            # Get only items not previously in db
            self._write_ip_and_application_info(source, 'address', ip_in_db[firewall_rules_name_to_id[group]], firewall_rules, [
                'logged_datetime', 'address', 'id'], type='source')
            self._write_ip_and_application_info(destination, 'address', ip_in_db[firewall_rules_name_to_id[group]], firewall_rules, [
                'logged_datetime', 'address', 'id'], type='destination')
            self._write_ip_and_application_info(application, 'application_id', application_in_db[firewall_rules_name_to_id[group]], firewall_rules, [
                'logged_datetime', 'application_id', 'id'], type='application')

            self._write_info_to_csv()
            self._write_info_to_db()
            subprocess.call(['rm', '/tmp/*.csv', '-rf'])

    def _write_granular(self, csv, traffic_log):
        if not traffic_log.is_granular_hour_written:
            data = self._read_csv(csv)
            dfs = self._read_tables_from_db()
            mapped_data = self._map_to_foreign_key(data, dfs)
            del data
            mapped_data['repeat_count'] = mapped_data['repeat_count'].astype(
                int)
            self._write_log(mapped_data, traffic_log.id, index=False,
                            table_name='core_trafficlogdetailgranularhour')
            traffic_log.is_granular_hour_written = True
            self._session.commit()

    def _write_to_db(self, csv: str, traffic_log, verbose=False):
        self.logging.info("Reading tables...")
        dfs = self._read_tables_from_db()
        self.logging.info("Reading csv...")
        # data = self._read_csv(csv)
        # self.logging.info("Getting unique items...")
        # params = self._get_unique(data, dfs)

        # if not traffic_log.is_log_detail_written:
        #     self.logging.info('Writing new items to db')
        #     self._write_new_items_to_db(params, verbose=verbose)
        #     del params
        #     dfs = self._read_tables_from_db()
        #     data = self._map_to_foreign_key(data, dfs)
        #     del dfs
        #     self.logging.info('Writing logs to db')
        #     self._write_log(data, traffic_log.id,
        #                     table_name='core_trafficlogdetail')
        #     traffic_log.is_log_detail_written = True
        #     del data
        #     self._session.commit()
        # print('Detail: ', time.time()-start)

        # data = self._read_csv(csv)
        # if not traffic_log.is_rule_written:
        #     self.logging.info('Writing rules to db')
        #     self._write_rules(RULES_PATH)
        #     traffic_log.is_rule_written = True
        #     self.logging.info('Cleaning rule db')
        #     self.clean()
        #     self._session.commit()
        df = self._read_csv_spark(csv)
        if not traffic_log.is_info_written:
            self.logging.info('Writing log info in db')
            self._write_info(df, traffic_log.id)
            traffic_log.is_info_written = True
            self._session.commit()

    def _get_date_from_filename(self, string):
        date = re.findall(r'[0-9]{4}_[0-9]{2}_[0-9]{2}',
                          string)[0].replace('_', '-')
        return date

    def _get_csv_paths(self, path: str):
        files = os.listdir(path)
        csvs = [os.path.join(path, f) for f in files if f.endswith('.csv')]
        return sorted(csvs)

    def _get_traffic_log(self, log_name):
        log = self._session.query(TrafficLog).filter_by(log_name=log_name)
        if not log.count():
            return self._write_traffic_log(log_name)
        return log[0]

    # TODO: Write functions using decorators
    def _run_for_detail(self, verbose=False):
        for csv in self._log_detail_csvs:
            # if verbose:
            self.logging.info(f'Writing detail to db: {csv}')
            filename = os.path.basename(csv)
            traffic_log = self._get_traffic_log(filename)
            self._write_to_db(csv, traffic_log, verbose=verbose)
            # os.remove(csv)

    def _run_for_granular_hour(self, verbose=False):
        for csv in self._granular_hour_csvs:
            import time
            start = time.time()
            # if verbose:
            self.logging.info(f'Writing granular hour to db: {csv}')

            filename = os.path.basename(csv)
            traffic_log = self._get_traffic_log(filename)
            self._write_granular(csv, traffic_log)
            print('time taken:', time.time()-start)
            # os.remove(csv)

    def run(self, verbose=False):
        self._run_for_detail(verbose=verbose)
        # self._run_for_granular_hour(verbose=verbose)

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
