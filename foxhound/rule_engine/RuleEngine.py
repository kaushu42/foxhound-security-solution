import os
import datetime
import traceback
from ..logger import Logger
from pyspark.sql.functions import concat, col, lit


class RuleEngine:
    def __init__(self, csv_path, *, spark):
        self.spark = spark
        self._csv_paths = self._get_csv_paths(csv_path)

    def _get_csv_paths(self, csv_path):
        files = [
            os.path.join(csv_path, f)
            for f in os.listdir(csv_path) if f.endswith('.csv')]
        return sorted(files)

    def _read_table_from_postgres(self, table):
        url = 'postgresql://localhost/fhdb'
        properties = {
            'user': 'foxhounduser',
            'password': 'foxhound123',
            'driver': 'org.postgresql.Driver'
        }
        return self.spark.read.jdbc(
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

    def _read_tables_from_db(self):
        firewall_rules = self._read_table_from_postgres('core_firewallrule')
        rules_table = self._read_table_from_postgres('rules_rule').drop('id')
        return firewall_rules, rules_table

    def _add_columns(self, df):
        name = concat(
            col("source_ip"),
            lit("--"),
            col("destination_ip"),
            lit("--"),
            col("application")
        ).alias('name')

        now = datetime.datetime.now()
        df = df.withColumn('name', name)
        df = df.withColumn('created_date_time', lit(now))
        df = df.withColumn('is_verified_rule', lit(False))
        df = df.withColumn('is_anomalous_rule', lit(False))
        df = df.withColumn('verified_date_time', lit(now))
        df = df.withColumn('description', lit(''))
        df = df.withColumn('verified_by_user_id', lit(1))

        return df

    def _run_for_one(self, csv_path):
        df = self.spark.read.csv(csv_path, header=True)
        df = df[['firewall_rule_id', 'application_id',
                 'source_ip_id', 'destination_ip_id']].dropDuplicates()

        firewall_rules, rules_table = self._read_tables_from_db()
        df = df.join(
            firewall_rules,
            on=[
                df.firewall_rule_id == firewall_rules.name
            ],
            how='left'
        ).drop('firewall_rule_id', 'name', 'tenant_id')\
            .withColumnRenamed('id', 'firewall_rule_id')

        df = df.join(
            rules_table,
            on=[
                df.application_id == rules_table.application,
                df.source_ip_id == rules_table.source_ip,
                df.destination_ip_id == rules_table.destination_ip,
                df.firewall_rule_id == rules_table.firewall_rule_id
            ],
            how='leftanti'
        ).withColumnRenamed('application_id', 'application')\
            .withColumnRenamed('source_ip_id', 'source_ip')\
            .withColumnRenamed('destination_ip_id', 'destination_ip')

        df = self._add_columns(df)

        self._write_df_to_postgres(df, 'rules_rule')

    def run(self):
        logger = Logger.getInstance()
        for csv in self._csv_paths:
            try:
                logger.info(f'Rule Engine: {csv}')
                print('****Processing File:', csv)
                self._run_for_one(csv)
            except Exception as e:
                logger.error(str(traceback.format_exc()))
                logger.info(f'Skipping {csv}')
                continue
