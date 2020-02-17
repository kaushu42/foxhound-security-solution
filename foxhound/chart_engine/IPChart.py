from .BaseChart import BaseChart


class IPChart(BaseChart):
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

        # Group by necessary columns
        grouped_df = df.groupBy(
            *self.headers,
            'logged_datetime',
            'source_ip_id'
        )

        # Aggregate the bytes
        grouped_df = grouped_df.agg({
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'source_ip_id': 'count'
        }).withColumnRenamed('sum(bytes_received)', 'bytes_received')\
            .withColumnRenamed('sum(bytes_sent)', 'bytes_sent')\
            .withColumnRenamed('count(source_ip_id)', 'count')\
            .withColumnRenamed('sum(packets_received)', 'packets_received')\
            .withColumnRenamed('sum(packets_sent)', 'packets_sent')\

        # Get the filters from db
        filters = self._read_table_from_postgres('core_filter')

        # Get filter ids to write to db
        ipchart = grouped_df.join(filters, on=[
            grouped_df.application_id == filters.application_id,
            grouped_df.firewall_rule_id == filters.firewall_rule_id,
            grouped_df.source_zone_id == filters.source_zone_id,
            grouped_df.destination_zone_id == filters.destination_zone_id,
            grouped_df.protocol_id == filters.protocol_id,
        ])[[
            'logged_datetime',
            'source_ip_id',
            'bytes_sent',
            'bytes_received',
            'packets_sent',
            'packets_received',
            'id',
            'count'
        ]]\
            .withColumnRenamed('source_ip_id', 'address')\
            .withColumnRenamed('id', 'filter_id')

        # Write to db
        self._write_df_to_postgres(ipchart, 'core_ipchart')

        return ipchart
