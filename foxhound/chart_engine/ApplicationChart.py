from .BaseChart import BaseChart


class ApplicationChart(BaseChart):
    def __init__(self, df):
        self.df = df

    def run(self):
        df = self.df
        # Group using firewall rule(tenant) and application
        groups = df.groupBy('firewall_rule_id',
                            'logged_datetime', 'application_id')

        # Calculate sum of bytes
        grouped_df = groups.agg({
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'application_id': 'count'
        })

        grouped_df = grouped_df.withColumnRenamed(
            'sum(bytes_sent)', 'sum_bytes_sent'
        ).withColumnRenamed(
            'sum(packets_sent)', 'sum_packets_sent'
        ).withColumnRenamed(
            'sum(bytes_received)', 'sum_bytes_received'
        ).withColumnRenamed(
            'sum(packets_received)', 'sum_packets_received'
        ).withColumnRenamed(
            'count(application_id)', 'count_events'
        )
        # # Cast column from float to int
        # grouped_df = grouped_df.withColumn(
        #     'bytes', grouped_df['bytes'].cast("int"))

        # Select only relevant columns
        grouped_df = grouped_df[[
            'firewall_rule_id',
            'logged_datetime', 'application_id',
            'sum_bytes_sent', 'sum_bytes_received',
            'sum_packets_sent', 'sum_packets_received',
            'count_events'
        ]]
        # Write to db
        self._write_df_to_postgres(grouped_df, 'fh_stg_trfc_chrt_app_dt_hr_a')
