import os
import datetime
from pyspark.sql.functions import concat, col, lit


class DailyTrafficRuleEngine:
    def __init__(self, input_traffic_log, db_engine, spark):
        self._INPUT_TRAFFIC_LOG = input_traffic_log
        self._db_engine = db_engine
        self._spark = spark
        self._REQUIRED_COLUMNS = ['Source address',
                                  'Destination address', 'Rule', 'Application']
        self._HEADER_NAMES = [
            "source_address", "destination_address", "firewall_rule", 'application']

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

    def _read_csv(self):
        print(f"reading file {self._INPUT_TRAFFIC_LOG}")
        self._df = self._spark.read.csv(self._INPUT_TRAFFIC_LOG, header=True)

    def _preprocess(self):
        self._df = self._df[self._REQUIRED_COLUMNS]
        self._df = self._df.toDF(*self._HEADER_NAMES)
        self._df = self._df.dropDuplicates()

    def _read_tables_from_db(self):
        firewall_rules = self._read_table_from_postgres('fh_prd_fw_rule_f')
        rules_table = self._read_table_from_postgres(
            'fh_stg_trfc_rule_f').drop('id')
        return firewall_rules, rules_table

    def _extract_rules_from_traffic_log(self):
        firewall_rules, rules_table = self._read_tables_from_db()
        self._df = self._df.join(
            firewall_rules, on=[self._df.firewall_rule == firewall_rules.name], how='left')
        self._df = self._df.withColumnRenamed('id', 'firewall_rule_id').select(
            'firewall_rule_id', 'source_address', 'destination_address', 'application')
        self._df = self._df.join(
            rules_table,
            on=[
                self._df.application == rules_table.application,
                self._df.source_address == rules_table.source_address,
                self._df.destination_address == rules_table.destination_address,
                self._df.firewall_rule_id == rules_table.firewall_rule_id
            ],
            how='leftanti')
        now = datetime.datetime.now()
        self._df = self._df.withColumn('name', concat(col('source_address'), lit(
            '---'), col('destination_address'), lit('---'), col('application')))
        self._df = self._df.withColumn('created_date_time', lit(now))
        self._df = self._df.withColumn('is_verified_rule', lit(False))
        self._df = self._df.withColumn('is_anomalous_rule', lit(False))
        self._df = self._df.withColumn('verified_date_time', lit(now))
        self._df = self._df.withColumn('description', lit(''))
        self._df = self._df.withColumn('verified_by_user_id', lit(1))
        self._write_df_to_postgres(self._df, 'fh_stg_trfc_rule_f', 'append')
        print("fh_stg_trfc_rule_f load successfully")

    def run(self):
        self._read_csv()
        self._preprocess()
        self._extract_rules_from_traffic_log()
