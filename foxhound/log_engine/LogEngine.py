import os
import datetime
import re


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

    def run(self):
        logs_in_db = self._read_table_from_postgres('core_trafficlog')
        logs = []
        for file in self._csvs:
            log_name = os.path.basename(file)
            log_date = self.get_date_from_filename(file)
            processed_datetime = datetime.date.today()
            logs.append([log_name, log_date, processed_datetime])
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
