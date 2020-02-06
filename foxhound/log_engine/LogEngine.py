import os
import datetime
import re

from pyspark.sql.functions import lit


class LogEngine:
    def __init__(self, input_dir, *, spark):
        self._csvs = self._get_files(input_dir)
        self._spark = spark

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

    def _get_files(self, path, filetype='csv'):
        return [os.path.join(path, f) for f in os.listdir(path) if f.endswith('csv')]

    def str_to_date(self, string):
        """
            Returns a datetime if the string can be converted to string.
            Else, return None
        """
        try:
            return datetime.datetime.strptime(string, '%Y/%m/%d').date()
        except Exception as e:
            print(e)
            return None

    def get_date_from_filename(self, filename):
        d = re.findall(r'[0-9]{4}_[0-9]{2}_[0-9]{2}',
                       filename)[0].replace("_", "/")
        return self.str_to_date(d)

    def _write_log_detail(self, df, log_name):
        grouped = df.groupby('Rule').count(
        ).withColumn('log', lit(log_name)).withColumnRenamed(
            'Rule', 'firewall_rule_id'
        )

        firewall_rules = self._read_table_from_postgres('core_firewallrule')

        grouped = grouped.join(
            firewall_rules,
            on=[grouped.firewall_rule_id == firewall_rules.name]
        ).drop(
            'firewall_rule_id', 'name', 'tenant_id'
        ).withColumnRenamed(
            'id', 'firewall_rule_id'
        ).withColumnRenamed(
            'count', 'rows'
        ).withColumn('processed_date', lit(datetime.date.today()))

        log_detail = self._read_table_from_postgres(
            'core_processedlogdetail')
        grouped = grouped.join(
            log_detail,
            on=[
                grouped.rows == log_detail.rows,
                grouped.firewall_rule_id == log_detail.firewall_rule_id,
                grouped.log == log_detail.log,
            ],
            how='leftanti'
        )
        self._write_df_to_postgres(grouped, 'core_processedlogdetail')

    def run(self):
        logs_in_db = self._read_table_from_postgres('core_trafficlog')
        logs = []
        for file in self._csvs:
            log_name = os.path.basename(file)
            log_date = self.get_date_from_filename(file)
            processed_datetime = datetime.date.today()
            logs.append([log_name, log_date, processed_datetime])

            df = self._spark.read.csv(file, header=True)
            self._write_log_detail(df, log_name)

        logs = self._spark.createDataFrame(logs)\
            .withColumnRenamed('_1', 'log_name')\
            .withColumnRenamed('_2', 'log_date')\
            .withColumnRenamed('_3', 'processed_datetime')

        logs = logs.join(
            logs_in_db,
            on=[logs.log_name == logs_in_db.log_name],
            how='leftanti'
        )
        self._write_df_to_postgres(logs, 'core_trafficlog')