import numpy as np
import ipaddress

from .Engine import Engine
import geoip2.database
import geoip2.errors
import pandas as pd
import pyspark
from pyspark.sql.types import StringType
from pyspark.sql.functions import to_timestamp, udf
from pyspark import SparkFiles


class PaloAltoEngine(Engine):
    def __init__(
        self,
        input_path: str,
        log_detail_output_path: str,
        log_granular_hour_output_path: str,
        spark_session: pyspark.sql.session.SparkSession,
        country_db_file
    ):
        super().__init__(
            input_path,
            log_detail_output_path,
            log_granular_hour_output_path,
            spark_session
        )
        self.country_db_file = country_db_file
        self._COLUMNS_TO_KEEP = [
            'Virtual System',
            'Source address', 'Source Port',
            'Destination address', 'Destination Port',
            'Bytes Sent', 'Bytes Received', 'Repeat Count',
            'Application', 'Packets Sent', 'Packets Received',
            'IP Protocol', 'Elapsed Time (sec)',
            'Source Zone', 'Destination Zone',
            'Rule', 'Time Logged', 'Inbound Interface',
            'Outbound Interface', 'Action',
            'Category', 'Session End Reason'
        ]

        self._INPUT_TO_OUTPUT_MAP = {
            j: i for i, j in zip(
                self._DATA_FIELDS,
                self._COLUMNS_TO_KEEP
            )
        }

    def _process(self, df):
        return self._rename_columns(df)

    @staticmethod
    def _resolve_ip_country(df, file):
        def getCountryNameFromIp(ip_address):
            if ipaddress.ip_address(ip_address).is_private:
                return "np"
            reader = geoip2.database.Reader(file)
            try:
                response = reader.city(ip_address)
                return response.country.iso_code.lower()
            except geoip2.errors.AddressNotFoundError:
                return "unk"

        getCountryNameFromIpUdf = udf(
            lambda x: getCountryNameFromIp(x), StringType())
        df = df.withColumn(
            "source_country", getCountryNameFromIpUdf(df.source_ip_id)
        ).withColumn(
            "destination_country",
            getCountryNameFromIpUdf(df.destination_ip_id)
        )
        return df

    def _rename_columns(self, df):
        df = df[self._COLUMNS_TO_KEEP]
        header_name = [self._INPUT_TO_OUTPUT_MAP[c] for c in df.columns]
        df = df.toDF(*header_name)
        return df

    def _get_col_name(self, s):
        # WARNING: RETURNS WHOLE STRING EXCEPT THE LAST CHARACTER
        # IF NO PARENTHESES IN STRING
        return s[s.find("(")+1:s.find(")")]

    def _granularize(self, df):
        df = self._rename_columns(df)
        df = df.withColumn('logged_datetime', to_timestamp(
            df.logged_datetime, 'yyyy/MM/dd HH'))
        group_columns = [
            'logged_datetime', 'source_ip_id', 'destination_ip_id',
            'firewall_rule_id', 'application_id', 'virtual_system_id',
            'source_zone_id', 'destination_zone_id', 'destination_port',
            'protocol_id', 'action_id', 'category_id',
            'session_end_reason_id'
        ]
        df = df.groupBy(*group_columns)
        df = df.agg({
            'repeat_count': 'mean',
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'time_elapsed': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum'
        })

        agg_col_names = [
            'sum(time_elapsed)',
            'sum(bytes_received)',
            'sum(packets_received)',
            'avg(repeat_count)',
            'sum(bytes_sent)',
            'sum(packets_sent)'
        ]

        for col_name in agg_col_names:
            df = df.withColumnRenamed(col_name, self._get_col_name(col_name))
        df = PaloAltoEngine._resolve_ip_country(df, self.country_db_file)
        return df
