import os
import datetime
import traceback
from pyspark.sql.functions import lit, to_timestamp, unix_timestamp, from_unixtime
from ..logger import Logger


class DailyTTEngine:
    def __init__(self, input_anomaly_log, *, spark):
        self._csv = input_anomaly_log
        self._spark = spark
        self._REQUIRED_COLUMNS = ['Threat/Content Type', 'Source address', 'Destination address', 'NAT Source IP',
                                  'NAT Destination IP', 'Application', 'Log Action',
                                  'NAT Destination Port', 'Rule', 'Flags', 'IP Protocol', 'Source Zone', 'Destination Zone',
                                  'Inbound Interface', 'Outbound Interface', 'Action', 'Category',
                                  'Session End Reason',  'Destination Port', 'Source Port',
                                  'Bytes Sent', 'Bytes Received', 'Repeat Count', 'Packets Received',
                                  'Packets Sent', 'Start Time', 'Elapsed Time (sec)', 'Virtual System', 'Device Name', 'reasons', 'log_name']
        self._HEADER_NAMES = ["threat_content_type", "source_address", "destination_address", 'nat_source_ip',
                              "nat_destination_ip", "application", "log_action",
                              "nat_destination_port", "firewall_rule", "flags", "protocol", "source_zone", "destination_zone",
                              "inbound_interface", "outbound_interface", "action", "category",
                              "session_end_reason", "destination_port", 'source_port',
                              "bytes_sent", "bytes_received", "repeat_count", "packets_received",
                              "packets_sent", "logged_datetime", "time_elapsed", 'vsys', 'device_name', 'reasons', 'log_name']

    def _preprocess(self, df):
        df = df[self._REQUIRED_COLUMNS]
        df = df.toDF(*self._HEADER_NAMES)
        df = df.dropDuplicates()
        return df

    def _read_table_from_postgres(self, table):
        url = 'postgresql://localhost/fhdb'
        properties = {
            'user': 'foxhounduser',
            'password': 'foxhound123',
            'driver': 'org.postgresql.Driver'
        }
        return self._spark.read.jdbc(
            url='jdbc:%s' % url,
            table=table,
            properties=properties
        )

    def _write_df_to_postgres(self, df, table_name, mode='append'):
        url = 'postgresql://localhost/fhdb'
        df.write.format('jdbc').options(
            url='jdbc:%s' % url,
            driver='org.postgresql.Driver',
            dbtable=table_name,
            user='foxhounduser',
            password='foxhound123').mode(mode).save()

    def _map_log_name_and_firewall_rule(self, df):
        firewall_rules = self._read_table_from_postgres(
            'FH_PRD_FW_RULE_F')
        logs = self._read_table_from_postgres('FH_PRD_TRFC_LOG_F')

        mapped = df.join(
            logs,
            on=[df.log_name == logs.log_name],
        ).drop(
            'log_name'
        ).withColumnRenamed(
            'id', 'log_id'
        ).drop(*logs.columns)

        mapped = mapped.join(
            firewall_rules, on=[
                mapped.firewall_rule == firewall_rules.name
            ]
        ).drop(
            'firewall_rule'
        ).withColumnRenamed(
            'id', 'firewall_rule_id'
        ).drop(*firewall_rules.columns)

        mapped = mapped.withColumn('logged_datetime', from_unixtime(unix_timestamp(
            mapped.logged_datetime, 'yy/MM/dd HH:mm:ss')).cast('timestamp'))
        return mapped

    def run(self):
        logger = Logger.getInstance()
        logger.info('TT Engine started')
        csv = self._csv
        try:
            logger.info(f'TT Engine: {csv}')
            df = self._spark.read.csv(csv, header=True, inferSchema=True)
            df = self._preprocess(df)
            mapped = self._map_log_name_and_firewall_rule(df)
            mapped = mapped.drop('vsys', 'inbound_interface', 'outbound_interface')\
                .withColumn('created_datetime', lit(datetime.datetime.now()))\
                .withColumn('is_closed', lit(False))
            self._write_df_to_postgres(
                mapped, 'fh_stg_tt_anmly_f')
        except Exception as e:
            print(str(traceback.format_exc()))
            logger.error(str(traceback.format_exc()))
            logger.info(f'Skipping {csv}')
        logger.info('TT Engine: Done')
