from pyspark.sql.functions import unix_timestamp, from_unixtime, to_timestamp, current_date, current_timestamp
from pyspark.sql.types import StructField, StructType, DoubleType, BooleanType, LongType, StringType, IntegerType, DateType, TimestampType
from pyspark.sql.functions import col, lit
import pyspark.sql.functions as F
from pyspark.sql.functions import udf
from pyspark.sql import SQLContext
from pyspark.sql import SparkSession
import re
import os
import uuid
import findspark
import random
import ipaddress
import pandas as pd
from sqlalchemy import create_engine
from psycopg2 import sql, connect
import datetime
import ast
import traceback
from foxhound.logger import Logger
import config as py_config

try:
    import configparser
except:
    from six.moves import configparser
config = configparser.ConfigParser()

config.read('../config.ini')

PG_DRIVER = ast.literal_eval(config.get("SPARK", "PG_DRIVER"))
SPARK_MASTER_URL = ast.literal_eval(config.get("SPARK", "SPARK_MASTER_URL"))
CLUSTER_SEEDS = ast.literal_eval(config.get("SPARK", "CLUSTER_SEEDS"))
SPARK_APP_NAME = ast.literal_eval(config.get("SPARK", "SPARK_APP_NAME"))
SPARK_DB_URL = ast.literal_eval(config.get("SPARK", "SPARK_DB_URL"))
SPARK_DB_DRIVER = ast.literal_eval(config.get("SPARK", "SPARK_DB_DRIVER"))
SPARK_CASDB_DRIVER = ast.literal_eval(
    config.get("SPARK", "SPARK_CASDB_DRIVER"))


HOST = ast.literal_eval(config.get("POSTGRES", "host"))
DB_NAME = ast.literal_eval(config.get("POSTGRES", "db_name"))
FH_DB_USER = ast.literal_eval(config.get("POSTGRES", "username"))
FH_DB_PASSWORD = ast.literal_eval(config.get("POSTGRES", "password"))

CAS_KEYSPACE = ast.literal_eval(config.get("CASSANDRA", "CAS_KEYSPACE"))


class DailyThreatMISEngine(object):
    def __init__(self, spark_session, db_engine, input_threat_log, output_dir):
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        self._spark = spark_session
        self._db_engine = db_engine
        self._INPUT_THREAT_LOG = input_threat_log
        self._OUTPUT_DIR = output_dir
        self._REQUIRED_COLUMNS = ['Rule']
        self._HEADER_NAMES = ["firewall_rule"]

    def _get_date_from_csv_filename(self, filename):
        d = re.findall(r'[0-9]{4}_[0-9]{2}_[0-9]{2}',
                       filename)[0].replace("_", "/")
        return d

    def _get_table(self, table_name):
        return pd.read_sql_table(table_name, self._db_engine)

    def _get_column_names_types(self, table_name):
        with self._db_engine.connect() as con:
            rs = con.execute(
                f"SELECT column_name,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name ='{table_name}'")
            columns = []
            column_types = []
            for row in rs:
                columns.append(row[0])
                column_types.append(row[1])
            return columns, column_types

    def _set_firewall_rules_id_to_data(self):
        firewall_rules_from_db = self._read_firewall_rules_from_db()

        @F.udf(returnType=IntegerType())
        def setFirewallRulesIdUdf(x):
            return firewall_rules_from_db[x]

        self._df = self._df.withColumn(
            "firewall_rule_id", setFirewallRulesIdUdf(self._df.firewall_rule))

    def _write_df_to_postgres(self, df, table_name, mode):
        if 'id' in df.columns:
            df_without_id = df.drop('id')
        else:
            df_without_id = df
        df_without_id.write.format('jdbc').options(
            url='jdbc:%s' % SPARK_DB_URL,
            driver=SPARK_DB_DRIVER,
            dbtable=table_name,
            user=FH_DB_USER,
            password=FH_DB_PASSWORD).mode(mode).save()
        del df_without_id

    def _read_firewall_rules_from_db(self):
        return pd.read_sql_table('fh_prd_fw_rule_f', self._db_engine).set_index("name").to_dict()["id"]

    def _write_new_firewall_rules_to_db(self):
        firewall_rules_schema = StructType([
            StructField("id", IntegerType(), True),
            StructField("name", StringType(), True),
            StructField("tenant_id", IntegerType(), True)])
        firewall_rules_from_db = self._get_table("fh_prd_fw_rule_f")
        firewall_rules_from_db = self._spark.createDataFrame(
            firewall_rules_from_db, firewall_rules_schema).select("name")
        firewall_rules_from_csv = self._df.select("firewall_rule").distinct()
        firewall_rules_from_csv.show()
        new_firewall_rules = firewall_rules_from_csv.subtract(
            firewall_rules_from_db).toDF(*["name"])
        new_firewall_rules = new_firewall_rules.withColumn("tenant_id", lit(1))
        self._write_df_to_postgres(
            new_firewall_rules, "fh_prd_fw_rule_f", "append")

    def _read_csv(self):
        print(f"reading file {self._INPUT_THREAT_LOG}")
        self._CSV_DATE = self._get_date_from_csv_filename(
            self._INPUT_THREAT_LOG)
        self._df = self._spark.read.csv(self._INPUT_THREAT_LOG, header=True)

    def _preprocess(self):
        self._df = self._df[self._REQUIRED_COLUMNS]
        self._df = self._df.toDF(*self._HEADER_NAMES)
        self._df = self._df.fillna({'firewall_rule': 'default'})

    def _create_spark_dateframe_from_table(self, table_name):
        columns, column_types = self._get_column_names_types(table_name)
        df = pd.read_sql(table_name, self._db_engine,
                         index_col="id").reset_index()
        df_struct = []
        for i in range(len(columns)):
            column_name = columns[i]
            column_type = column_types[i]
            if column_type == 'integer':
                s = StructField(column_name, IntegerType(), True)
            elif column_type == 'timestamp with time zone':
                s = StructField(column_name, TimestampType(), True)
            elif column_type == 'character varying':
                s = StructField(column_name, StringType(), True)
            elif column_type == 'numeric':
                s = StructField(column_name, DoubleType(), True)
            elif column_type == 'bigint':
                s = StructField(column_name, LongType(), True)
            elif column_type == 'date':
                s = StructField(column_name, TimestampType(), True)
            else:
                s = StructField(column_name, StringType(), True)
            df_struct.append(s)
        schema = StructType(df_struct)
        return self._spark.createDataFrame(df, schema)

    def run(self):
        logger = Logger.getInstance()
        logger.info(f'Daily Threat MIS Engine: {self._INPUT_THREAT_LOG}')
        self._read_csv()
        self._preprocess()
        logger.info(f'log sucessfullly loaded')
        self._write_new_firewall_rules_to_db()
        logger.info(f'fh_prd_fw_rule_f successfully loaded')
