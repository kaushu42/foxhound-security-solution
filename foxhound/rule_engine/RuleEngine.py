import os
import datetime

import pandas as pd
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker
from pyspark.sql import SparkSession
from pyspark.sql.types import StructField, StructType, StringType, IntegerType
from pyspark.sql.functions import concat, col, lit


class RuleEngine:
    def __init__(self, csv_path, db_engine, spark_session):
        self.df = spark.read.csv(csv_path, header=True)
        self._db_engine = db_engine
        self.spark = spark_session

    def _get_cols(self):
        CSV_COLS = [
            'firewall_rule_id', 'source_ip_id',
            'destination_ip_id', 'application_id',
        ]

        TEMP_COLS = ['id', 'source_ip_id',
                     'destination_ip_id', 'application_id']

        DB_COLS = ['firewall_rule_id', 'source_ip',
                   'destination_ip', 'application']

        OLD_COLS = [
            'created_date_time', 'name', 'source_ip_id',
            'destination_ip_id', 'application_id',
            'description', 'is_verified_rule',
            'is_anomalous_rule', 'verified_date_time',
            'id', 'verified_by_user_id']

        NEW_COLS = [
            'created_date_time', 'name', 'source_ip',
            'destination_ip', 'application', 'description',
            'is_verified_rule', 'is_anomalous_rule', 'verified_date_time',
            'firewall_rule_id', 'verified_by_user_id'
        ]

        return CSV_COLS, DB_COLS, TEMP_COLS, OLD_COLS, NEW_COLS

    def _get_schema(self):
        return StructType([StructField('firewall_rule_id', IntegerType()),
                           StructField('source_ip', StringType()),
                           StructField('destination_ip', StringType()),
                           StructField('application', StringType()),
                           ])

    def _get_tables(self, db_cols):
        # Get firewall rules table and rules table
        FIREWALL_RULE_TABLE = 'core_firewallrule'
        RULES_TABLE = 'rules_rule'
        firewall_rules = pd.read_sql_table(
            FIREWALL_RULE_TABLE, self._db_engine)
        firewall_rules = spark.createDataFrame(firewall_rules)
        rules_table = pd.read_sql_table('rules_rule', self._db_engine)[db_cols]
        schema = self._get_schema()
        rules_table = spark.createDataFrame(rules_table, schema=schema)
        return firewall_rules, rules_table

    def _add_columns(self, df):
        name = concat(
            col("source_ip_id"),
            lit("--"),
            col("destination_ip_id"),
            lit("--"),
            col("application_id")
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

    def _write_to_csv(self, df, out_path):
        df.write.csv(out_path, header=True, mode='overwrite')

    def write(self):
        TMP_FILE_PATH = '/tmp/kaush.csv'
        # Only keep these cols
        CSV_COLS, DB_COLS, TEMP_COLS, OLD_COLS, NEW_COLS = self._get_cols()

        self.df = self.df[CSV_COLS].dropDuplicates()

        # Get firewall rules from database
        firewall_rules, rules_table = self._get_tables(DB_COLS)

        # Replace firewall rule name with firewall rule id from database
        df = self.df.join(
            firewall_rules,
            [self.df.firewall_rule_id == firewall_rules.name],
            how='left'
        )[TEMP_COLS]

        # Join the rules from csv with rules from db to get new rules
        df = df.join(
            rules_table,
            [
                df.id == rules_table.firewall_rule_id,
                df.source_ip_id == rules_table.source_ip,
                df.destination_ip_id == rules_table.destination_ip,
                df.application_id == rules_table.application,
            ],
            how='left',
        )[TEMP_COLS]

        df = self._add_columns(df)

        new_rules = df[OLD_COLS]

        for old, new in zip(OLD_COLS, NEW_COLS):
            new_rules = new_rules.withColumnRenamed(old, new)
        self._write_to_csv(new_rules, TMP_FILE_PATH)


if __name__ == "__main__":
    db_name = os.environ.get('FH_DB_NAME', '')
    db_user = os.environ.get('FH_DB_USER', '')
    db_password = os.environ.get('FH_DB_PASSWORD', '')
    db_engine = create_engine(
        f'postgresql://{db_user}:{db_password}@localhost:5432/{db_name}'
    )
    import findspark
    findspark.init()
    SPARK_MASTER_URL = "spark://127.0.0.1:7077"
    SPARK_MASTER_LOCAL_URL = "master[*]"
    CLUSTER_SEEDS = ['172.16.3.36', '172.16.3.37', '127.0.0.1'][-1]
    SPARK_APP_NAME = 'foxhound'
    spark = SparkSession.builder.master(
        SPARK_MASTER_URL
    ).appName(
        SPARK_APP_NAME
    ).config(
        'spark.cassandra.connection.host',
        ','.join(CLUSTER_SEEDS)
    ).getOrCreate()
    csv_path = '/home/kaush/projects/foxhound/outputs/traffic_logs/Silverlining-PAVM-Primary_traffic_2019_03_08_last_calendar_day.csv/part-00000-6251a05b-bebb-498b-a2be-dffae4dc6b8f-c000.csv'
    rule = RuleEngine(csv_path, db_engine, spark)
    rule.write()
