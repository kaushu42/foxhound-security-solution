import os
import datetime
import traceback
import pandas as pd

from ..logger import Logger
from .BaseChart import BaseChart
from .ApplicationChart import ApplicationChart
from .IPChart import IPChart
from .TimeSeriesChart import TimeSeriesChart
from .SankeyChart import SankeyChart


class ChartEngine(BaseChart):
    def __init__(self, input_path, *, spark, db_engine):
        self._csv_paths = self._get_file_paths(input_path)
        self._spark = spark
        self._db_engine = db_engine
        self._cursor = self._get_cursor()

    def read(self, single_csv_path):
        self._spark.read.csv(single_csv_path, header=True)

    def _get_file_paths(self, csv_path):
        file_paths = [
            os.path.join(csv_path, f)
            for f in os.listdir(csv_path) if f.endswith('.csv')
        ]
        return file_paths

    def _get_cursor(self):
        cursor = self._db_engine.raw_connection().cursor()
        return cursor

    def _write_new_items_to_db_for_one(self, df, table, col_name):
        # Read table from db
        tbl = self._read_table_from_postgres(table).select('name')
        tbl = tbl.withColumnRenamed('name', col_name)

        # Get distinct items from csv
        new_tbl = df.select(col_name).distinct()

        # Select only items from csv that are not in db
        new_tbl = new_tbl.join(
            tbl, on=[col_name], how='leftanti').withColumnRenamed(
                col_name, 'name'
        )

        # Write to db
        self._write_df_to_postgres(new_tbl, table)

    def _write_new_items_to_db(self, df):
        self._write_new_items_to_db_for_one(
            df, 'core_application', 'application_id')
        self._write_new_items_to_db_for_one(df, 'core_zone', 'source_zone_id')
        self._write_new_items_to_db_for_one(
            df, 'core_zone', 'destination_zone_id')
        self._write_new_items_to_db_for_one(df, 'core_protocol', 'protocol_id')

    # Stage filters to a temp table
    def _stage_filters(self, groups):
        groups = self._spark.createDataFrame(groups)
        self._write_df_to_postgres(groups, 'core_stagingfilter')

    # Clear the staging area
    def _clear_staging_area(self):
        self._cursor.execute('TRUNCATE core_stagingfilter;')
        self._cursor.execute(
            'ALTER sequence core_stagingfilter_id_seq restart;')
        self._cursor.connection.commit()

    def _create_idx_on_groups(self):
        query = '''
            CREATE UNIQUE INDEX idx_filter
            ON
            core_filter(
                firewall_rule_id,
                application_id,
                destination_zone_id,
                source_zone_id,
                protocol_id
            );
        '''
        try:
            self._cursor.execute(query)
        except Exception as e:
            print('Exception:', e)
            self._cursor.execute('rollback;')

    def _map_df_to_fk(self, df):
        firewall_rules = self._read_table_from_postgres('core_firewallrule')
        applications = self._read_table_from_postgres('core_application')
        zones = self._read_table_from_postgres('core_zone')
        protocols = self._read_table_from_postgres('core_protocol')

        # Map firewall rules
        x = df.join(firewall_rules, on=[
            df.firewall_rule_id == firewall_rules.name
        ]).drop(
            'firewall_rule_id',
            'name',
            'tenant_id'
        ).withColumnRenamed('id', 'firewall_rule_id')

        # Map Applications
        x = x.join(applications, on=[
            x.application_id == applications.name
        ]).drop(
            'application_id',
            'name'
        ).withColumnRenamed('id', 'application_id')

        # Map Source Zones
        x = x.join(zones, on=[
            x.source_zone_id == zones.name
        ]).drop(
            'source_zone_id',
            'name'
        ).withColumnRenamed('id', 'source_zone_id')

        # Map Destinaton Zones
        x = x.join(zones, on=[
            x.destination_zone_id == zones.name
        ]).drop(
            'destination_zone_id',
            'name'
        ).withColumnRenamed('id', 'destination_zone_id')

        # Map Protocols
        x = x.join(protocols, on=[
            x.protocol_id == protocols.name
        ]).drop('protocol_id', 'name').withColumnRenamed('id', 'protocol_id')

        # Cast the logged datetime as timestamp type
        x = x.withColumn('logged_datetime',
                         x['logged_datetime'].cast("timestamp"))
        return x

    def _write_filters_to_db(self):
        self._create_idx_on_groups()
        query = '''
            INSERT INTO core_filter(
                source_zone_id,
                destination_zone_id,
                application_id,
                firewall_rule_id,
                protocol_id
            )
            SELECT source_zone_id,
                destination_zone_id,
                application_id,
                firewall_rule_id,
                protocol_id
            FROM core_stagingfilter
            ON CONFLICT DO NOTHING;
        '''
        self._cursor.execute(query)
        self._cursor.connection.commit()

    def _get_filter_groups(self, df):
        headers = ['application_id', 'source_zone_id',
                   'destination_zone_id', 'firewall_rule_id', 'protocol_id']
        groups = [[x.__getattr__(h) for h in headers]
                  for x in df.select(*headers).distinct().collect()]
        groups = pd.DataFrame(groups)
        groups.columns = headers
        return groups

    def _process_filters(self, df):
        groups = self._get_filter_groups(df)
        self._stage_filters(groups)
        self._write_filters_to_db()
        self._clear_staging_area()

    def run(self):
        logger = Logger()
        for csv in self._csv_paths:
            try:
                logger.info(f'Chart Engine: {csv}')
                df = self._spark.read.csv(csv, header=True)

                print('**Writing new items to db**')
                logger.info(f'Chart Engine: Writing new items to db')
                self._write_new_items_to_db(df)

                print('**Mapping to Foreign Keys**')
                logger.info(f'Chart Engine: Mapping Foreign Keys')
                df = self._map_df_to_fk(df)

                # Persist the dataframe for faster processing
                df.cache()

                print('**Processing Filters**')
                logger.info(f'Chart Engine: Processing Filters')
                self._process_filters(df)

                # Create all the necessary charts
                print('**Writing Application Chart Data**')
                logger.info(f'Chart Engine: Writing Application Chart Data')
                ApplicationChart(df).run()

                print('**Writing Time Series Chart Data**')
                logger.info(f'Chart Engine: Writing Time Series Chart Data')
                TimeSeriesChart(df, spark=self._spark).run()

                print('**Writing IP Profile Chart Data**')
                logger.info(f'Chart Engine: Writing IP Profile Chart Data')
                IPChart(df, spark=self._spark).run()

                print('**Writing Sankey Chart Data**')
                logger.info(f'Chart Engine: Writing Sankey Chart Data')
                SankeyChart(df, spark=self._spark).run()

                # Unpersist the dataframe to free space
                df.unpersist()
            except Exception as e:
                logger.error(str(traceback.format_exc()))
                logger.info(f'Skipping {csv}')
                continue
        logger.info('Chart Engine: Done')
        logger.close()
        print('Chart Engine finished running on:', datetime.datetime.now())
