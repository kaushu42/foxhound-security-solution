import os
import ipaddress

from pyspark.sql.functions import udf
from pyspark.sql.types import StringType

from .BaseChart import BaseChart


class SankeyChart(BaseChart):
    def __init__(self, df, *, spark):
        self.df = df
        self._spark = spark
        self.headers = ['application_id',
                        'source_zone_id',
                        'destination_zone_id',
                        'firewall_rule_id',
                        'protocol_id']

    def run(self):
        df = self.df
        toPublicAddressUdf = udf(lambda x: x if ipaddress.ip_address(
            x).is_private else "Public Address", StringType())
        df = df.withColumn(
            "source_address", toPublicAddressUdf(df.source_address)).withColumn(
            "destination_address", toPublicAddressUdf(df.destination_address))
        # Group by necessary columns
        grouped_df = df.groupBy(
            *self.headers,
            'logged_datetime',
            'source_address',
            'destination_address'
        )

        # Aggregate the bytes
        grouped_df = grouped_df.agg({
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'source_address': 'count'
        }).withColumnRenamed('sum(bytes_received)', 'bytes_received')\
            .withColumnRenamed('sum(bytes_sent)', 'bytes_sent')\
            .withColumnRenamed('count(source_address)', 'count')\
            .withColumnRenamed('sum(packets_received)', 'packets_received')\
            .withColumnRenamed('sum(packets_sent)', 'packets_sent')
        # Get the filters from db
        filters = self._read_table_from_postgres('fh_prd_trfc_fltr_f')

        # Get filter ids to write to db
        sankey_chart = grouped_df.join(filters, on=[
            grouped_df.application_id == filters.application_id,
            grouped_df.firewall_rule_id == filters.firewall_rule_id,
            grouped_df.source_zone_id == filters.source_zone_id,
            grouped_df.destination_zone_id == filters.destination_zone_id,
            grouped_df.protocol_id == filters.protocol_id,
        ])[[
            'logged_datetime',
            'source_address',
            'destination_address',
            'bytes_sent',
            'bytes_received',
            'packets_sent',
            'packets_received',
            'id',
            'count'
        ]]\
            .withColumnRenamed('source_address', 'source_address')\
            .withColumnRenamed('destination_address', 'destination_address')\
            .withColumnRenamed('id', 'filter_id')

        self._write_df_to_postgres(
            sankey_chart, 'fh_stg_trfc_chrt_con_dt_hr_a')

        return sankey_chart
