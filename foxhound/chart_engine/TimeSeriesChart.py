from .BaseChart import BaseChart


class TimeSeriesChart(BaseChart):

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

        # Group by necessary cols
        grouped_df = df.groupby(*self.headers, 'logged_datetime')

        # Aggregate the bytes values
        grouped_df = grouped_df.agg({
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'application_id': 'count'
        })\
            .withColumnRenamed('sum(bytes_received)', 'sum_bytes_received')\
            .withColumnRenamed('sum(bytes_sent)', 'sum_bytes_sent')\
            .withColumnRenamed('sum(packets_received)', 'sum_packets_received')\
            .withColumnRenamed('sum(packets_sent)', 'sum_packets_sent')\
            .withColumnRenamed('count(application_id)', 'count_events')

        # Get filters from db
        filters = self._read_table_from_postgres('fh_prd_trfc_fltr_f')

        # Map filters to foreign keys
        grouped_df = grouped_df.join(filters, on=[
            grouped_df.application_id == filters.application_id,
            grouped_df.firewall_rule_id == filters.firewall_rule_id,
            grouped_df.source_zone_id == filters.source_zone_id,
            grouped_df.destination_zone_id == filters.destination_zone_id,
            grouped_df.protocol_id == filters.protocol_id,
        ])[[
            'logged_datetime',
            'sum_bytes_sent',
            'sum_bytes_received',
            'sum_packets_sent',
            'sum_packets_received',
            'count_events',
            'id']].withColumnRenamed('id', 'filter_id')

        # Write to db
        self._write_df_to_postgres(
            grouped_df, 'fh_stg_trfc_chrt_tm_srs_dt_hr_a')

        return grouped_df
