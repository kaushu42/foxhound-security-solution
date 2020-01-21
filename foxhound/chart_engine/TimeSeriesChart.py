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
            'bytes_received': 'sum'
        })\
            .withColumnRenamed('sum(bytes_received)', 'bytes_received')\
            .withColumnRenamed('sum(bytes_sent)', 'bytes_sent')

        # Get filters from db
        filters = self._read_table_from_postgres('core_filter')

        # Map filters to foreign keys
        grouped_df = grouped_df.join(filters, on=[
            grouped_df.application_id == filters.application_id,
            grouped_df.firewall_rule_id == filters.firewall_rule_id,
            grouped_df.source_zone_id == filters.source_zone_id,
            grouped_df.destination_zone_id == filters.destination_zone_id,
            grouped_df.protocol_id == filters.protocol_id,
        ])[[
            'logged_datetime',
            'bytes_sent',
            'bytes_received',
            'id']].withColumnRenamed('id', 'filter_id')\
            .withColumn('bytes_sent', grouped_df['bytes_sent'].cast("int"))\
            .withColumn('bytes_received', grouped_df['bytes_received'].cast("int"))

        # Write to db
        self._write_df_to_postgres(grouped_df, 'core_timeserieschart')

        return grouped_df
