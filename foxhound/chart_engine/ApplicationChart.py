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
        grouped_df = groups.agg({'bytes_sent': 'sum', 'bytes_received': 'sum'})

        grouped_df = grouped_df.withColumn(
            'bytes',
            grouped_df['sum(bytes_sent)'] + grouped_df['sum(bytes_received)']
        )

        # Cast column from float to int
        grouped_df = grouped_df.withColumn(
            'bytes', grouped_df['bytes'].cast("int"))

        # Select only relevant columns
        grouped_df = grouped_df[['firewall_rule_id',
                                 'logged_datetime', 'application_id', 'bytes']]

        # Write to db
        self._write_df_to_postgres(grouped_df, 'core_applicationchart')
