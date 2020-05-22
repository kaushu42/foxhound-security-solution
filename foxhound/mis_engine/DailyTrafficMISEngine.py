from pyspark.sql.functions import unix_timestamp, from_unixtime, to_timestamp, current_date, current_timestamp
from pyspark.sql.types import StructField, StructType, DoubleType, BooleanType,LongType, StringType, IntegerType, DateType, TimestampType
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
from ..logger import Logger
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


class DailyTrafficMISEngine(object):
    def __init__(self, spark_session, db_engine, input_traffic_log, output_dir):
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        self._spark = spark_session
        self._db_engine = db_engine
        self._INPUT_TRAFFIC_LOG = input_traffic_log
        self._OUTPUT_DIR = output_dir
        self._REQUIRED_COLUMNS = ['Source address', 'Destination address', 'Application',
                                  'IP Protocol', 'Source Zone', 'Destination Zone', 'Rule',
                                  'Inbound Interface', 'Outbound Interface', 'Action', 'Category',
                                  'Session End Reason', 'Sequence Number', 'Source Port', 'Destination Port',
                                  'Bytes Sent', 'Bytes Received', 'Repeat Count', 'Packets Received', 
                                  'Packets Sent','Start Time', 'Elapsed Time (sec)', 'Virtual System']
        self._HEADER_NAMES = ["source_address", "destination_address", "application",
                              "protocol", "source_zone", "destination_zone", "firewall_rule",
                              "inbound_interface", "outbound_interface", "action", "category",
                              "session_end_reason", "row_number", "source_port", "destination_port",
                              "bytes_sent", "bytes_received", "repeat_count", "packets_received",
                              "packets_sent", "logged_datetime", "time_elapsed", 'vsys']
    
    def _get_date_from_csv_filename(self, filename):
        d = re.findall(r'[0-9]{4}_[0-9]{2}_[0-9]{2}',filename)[0].replace("_", "/")
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
        
        self._df = self._df.withColumn("firewall_rule_id", setFirewallRulesIdUdf(self._df.firewall_rule))
    
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
        new_firewall_rules = firewall_rules_from_csv.subtract(
            firewall_rules_from_db).toDF(*["name"])
        new_firewall_rules = new_firewall_rules.withColumn("tenant_id", lit(1))
        self._write_df_to_postgres(new_firewall_rules, "fh_prd_fw_rule_f", "append")
        print("fh_prd_fw_rule_f successfully loaded")
    
    def _read_csv(self):
        print(f"reading file {self._INPUT_TRAFFIC_LOG}")
        self._CSV_DATE = self._get_date_from_csv_filename(self._INPUT_TRAFFIC_LOG)
        self._df = self._spark.read.csv(self._INPUT_TRAFFIC_LOG, header=True)

    def _preprocess(self):
        self._df = self._df[self._REQUIRED_COLUMNS]
        self._df = self._df.toDF(*self._HEADER_NAMES)
        self._df = self._df.withColumn("logged_datetime", to_timestamp(
            self._df.logged_datetime, 'yyyy/MM/dd'))
        self._df = self._df.withColumn("processed_datetime", current_date())
        self._df = self._df.withColumn('processed_datetime',
                           to_timestamp(self._df.processed_datetime))
        self._df = self._df.withColumn(
            "source_port", self._df["source_port"].cast(IntegerType()))
        self._df = self._df.withColumn(
            "destination_port", self._df["destination_port"].cast(IntegerType()))
        self._df = self._df.withColumn(
            "bytes_sent", self._df["bytes_sent"].cast(LongType()))
        self._df = self._df.withColumn(
            "bytes_received", self._df["bytes_received"].cast(LongType()))
        self._df = self._df.withColumn(
            "packets_received", self._df["packets_received"].cast(LongType()))
        self._df = self._df.withColumn(
            "packets_sent", self._df["packets_sent"].cast(LongType()))
        self._df = self._df.withColumn(
            "time_elapsed", self._df["time_elapsed"].cast(LongType()))
        self._df = self._df.withColumn(
            "repeat_count", self._df["repeat_count"].cast(LongType()))
        self._df = self._df.withColumn("count_events", lit(1))
    
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
    
    def _set_processed_datetime(self, df):
        df = df.withColumn("processed_datetime", current_date())
        df = df.withColumn('processed_datetime',
                           to_timestamp(df.processed_datetime))
        return df
    
    def _set_logged_datetime(self, df):
        csv_date = datetime.datetime.strptime(self._CSV_DATE, '%Y/%m/%d')
        df = df.withColumn("logged_datetime", unix_timestamp(
            lit(csv_date), 'yyyy-MM-dd').cast("timestamp"))
        return df

    def _extract_mis_daily(self):
        GROUPING_COLUMNS = ['processed_datetime','logged_datetime', 'firewall_rule_id','source_zone', 'destination_zone', 'application', 'protocol']
        COLUMN_HEADERS = ['processed_datetime', 'logged_datetime', 'source_zone', 'destination_zone', 'application', 'protocol',
                          'avg_repeat_count', 'sum_bytes_sent', 'sum_bytes_received', 'sum_packets_received', 'sum_packets_sent',
                          'sum_time_elapsed', 'count_events', 'firewall_rule_id']
        grouped_df = self._df.groupby(*GROUPING_COLUMNS)
        grouped_agg = grouped_df.agg({
            'repeat_count': 'mean',
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'time_elapsed': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'count_events': 'count'})
        grouped_agg = grouped_agg.withColumnRenamed(
            "sum(time_elapsed)", "sum_time_elapsed").withColumnRenamed(
            "sum(bytes_received)", "sum_bytes_received").withColumnRenamed(
            "sum(packets_received)", "sum_packets_received").withColumnRenamed(
            "sum(packets_sent)", "sum_packets_sent").withColumnRenamed(
            "avg(repeat_count)", "avg_repeat_count").withColumnRenamed(
            "sum(bytes_sent)", "sum_bytes_sent").withColumnRenamed(
            "count(count_events)", "count_events")
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(grouped_agg,"fh_stg_trfc_mis_dy_a","append")
        print("fh_stg_trfc_mis_dy_a successfully loaded")
        del grouped_agg,grouped_df

    def _extract_mis_new_source_address(self):
        @F.udf(returnType=BooleanType())
        def filter_public_records(source_ip):
            return ipaddress.ip_address(source_ip).is_private

        ip_from_db_df = self._create_spark_dateframe_from_table("fh_stg_trfc_mis_new_src_ip_dy_a"
                                                                ).select("firewall_rule_id", "source_address")
        new_unique_source_address = self._df.filter(filter_public_records(self._df.source_address))
        new_unique_source_address = new_unique_source_address.join(ip_from_db_df, on=['firewall_rule_id','source_address'], how='left_anti')
        
        GROUPING_COLUMNS = ['processed_datetime','logged_datetime','firewall_rule_id','source_address']
        COLUMN_HEADERS = ['processed_datetime', 'logged_datetime','source_address','avg_repeat_count', 'sum_bytes_sent', 'sum_bytes_received', 'sum_packets_received', 'sum_packets_sent',
                          'sum_time_elapsed', 'count_events', 'firewall_rule_id',]
        grouped_df = new_unique_source_address.groupby(*GROUPING_COLUMNS)
        grouped_agg = grouped_df.agg({
            'repeat_count': 'mean',
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'time_elapsed': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'count_events': 'count'})
        grouped_agg = grouped_agg.withColumnRenamed(
            "sum(time_elapsed)", "sum_time_elapsed").withColumnRenamed(
            "sum(bytes_received)", "sum_bytes_received").withColumnRenamed(
            "sum(packets_received)", "sum_packets_received").withColumnRenamed(
            "sum(packets_sent)", "sum_packets_sent").withColumnRenamed(
            "avg(repeat_count)", "avg_repeat_count").withColumnRenamed(
            "sum(bytes_sent)", "sum_bytes_sent").withColumnRenamed(
            "count(count_events)", "count_events")
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(grouped_agg,"fh_stg_trfc_mis_new_src_ip_dy_a","append")
        print("fh_stg_trfc_mis_new_src_ip_dy_a successfully loaded")
        del grouped_agg,ip_from_db_df,new_unique_source_address,grouped_df

    def _extract_mis_new_destination_address(self):
        @F.udf(returnType=BooleanType())
        def filter_public_records(destination_ip):
            return ipaddress.ip_address(destination_ip).is_private

        ip_from_db_df = self._create_spark_dateframe_from_table("fh_stg_trfc_mis_new_dst_ip_dy_a"
                                                                ).select("firewall_rule_id", "destination_address")
        new_unique_destination_address = self._df.filter(filter_public_records(self._df.destination_address))
        new_unique_destination_address = new_unique_destination_address.join(ip_from_db_df, on=['firewall_rule_id','destination_address'], how='left_anti')
        
        GROUPING_COLUMNS = ['processed_datetime','logged_datetime','firewall_rule_id','destination_address']
        COLUMN_HEADERS = ['processed_datetime', 'logged_datetime','destination_address','avg_repeat_count', 'sum_bytes_sent', 'sum_bytes_received', 'sum_packets_received', 'sum_packets_sent',
                          'sum_time_elapsed', 'count_events', 'firewall_rule_id',]
        grouped_df = new_unique_destination_address.groupby(*GROUPING_COLUMNS)
        grouped_agg = grouped_df.agg({
            'repeat_count': 'mean',
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'time_elapsed': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'count_events': 'count'})
        grouped_agg = grouped_agg.withColumnRenamed(
            "sum(time_elapsed)", "sum_time_elapsed").withColumnRenamed(
            "sum(bytes_received)", "sum_bytes_received").withColumnRenamed(
            "sum(packets_received)", "sum_packets_received").withColumnRenamed(
            "sum(packets_sent)", "sum_packets_sent").withColumnRenamed(
            "avg(repeat_count)", "avg_repeat_count").withColumnRenamed(
            "sum(bytes_sent)", "sum_bytes_sent").withColumnRenamed(
            "count(count_events)", "count_events")
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(grouped_agg,"fh_stg_trfc_mis_new_dst_ip_dy_a","append")
        print("fh_stg_trfc_mis_new_dst_ip_dy_a successfully loaded")
        del grouped_agg,ip_from_db_df,new_unique_destination_address,grouped_df

    def _extract_mis_new_application(self):
        app_from_db_df = self._create_spark_dateframe_from_table("fh_stg_trfc_mis_new_app_dy_a"
                                                                ).select("firewall_rule_id", "application")
        new_unique_application = self._df.join(app_from_db_df, on=['firewall_rule_id','application'], how='left_anti')
        
        GROUPING_COLUMNS = ['processed_datetime','logged_datetime','firewall_rule_id','application']
        COLUMN_HEADERS = ['processed_datetime', 'logged_datetime','application','avg_repeat_count', 'sum_bytes_sent', 'sum_bytes_received', 'sum_packets_received', 'sum_packets_sent',
                          'sum_time_elapsed', 'count_events', 'firewall_rule_id',]
        grouped_df = new_unique_application.groupby(*GROUPING_COLUMNS)
        grouped_agg = grouped_df.agg({
            'repeat_count': 'mean',
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'time_elapsed': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'count_events': 'count'})
        grouped_agg = grouped_agg.withColumnRenamed(
            "sum(time_elapsed)", "sum_time_elapsed").withColumnRenamed(
            "sum(bytes_received)", "sum_bytes_received").withColumnRenamed(
            "sum(packets_received)", "sum_packets_received").withColumnRenamed(
            "sum(packets_sent)", "sum_packets_sent").withColumnRenamed(
            "avg(repeat_count)", "avg_repeat_count").withColumnRenamed(
            "sum(bytes_sent)", "sum_bytes_sent").withColumnRenamed(
            "count(count_events)", "count_events")
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(grouped_agg,"fh_stg_trfc_mis_new_app_dy_a","append")
        print("fh_stg_trfc_mis_new_app_dy_a successfully loaded")
        del grouped_agg,app_from_db_df,new_unique_application,grouped_df
        
    def _extract_mis_requests_from_blacklisted_ip_event(self):
        blacklisted_ip_from_db = self._create_spark_dateframe_from_table("core_blacklistedip"
        ).select("ip_address").withColumnRenamed("ip_address","source_address")
        filtered_df = self._df.join(blacklisted_ip_from_db, ["source_address"], "leftanti")
        COLUMN_HEADERS = ['processed_datetime', 'logged_datetime', 'firewall_rule_id', 'source_address', 'destination_address', 'application',
                          'protocol', 'source_zone', 'destination_zone', 'inbound_interface', 'outbound_interface',
                          'action', 'category', 'session_end_reason', 'destination_port','avg_repeat_count', 'sum_bytes_sent', 
                          'sum_bytes_received', 'sum_packets_received', 'sum_packets_sent',
                          'sum_time_elapsed', 'count_events']
        
        GROUPING_COLUMNS = ['processed_datetime','logged_datetime','firewall_rule_id', 'source_address', 'destination_address', 'application',
                          'protocol', 'source_zone', 'destination_zone', 'inbound_interface', 'outbound_interface',
                          'action', 'category', 'session_end_reason','destination_port']
        grouped_df = filtered_df.groupby(*GROUPING_COLUMNS)
        grouped_agg = grouped_df.agg({
            'repeat_count': 'mean',
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'time_elapsed': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'count_events': 'count'})
        grouped_agg = grouped_agg.withColumnRenamed(
            "sum(time_elapsed)", "sum_time_elapsed").withColumnRenamed(
            "sum(bytes_received)", "sum_bytes_received").withColumnRenamed(
            "sum(packets_received)", "sum_packets_received").withColumnRenamed(
            "sum(packets_sent)", "sum_packets_sent").withColumnRenamed(
            "avg(repeat_count)", "avg_repeat_count").withColumnRenamed(
            "sum(bytes_sent)", "sum_bytes_sent").withColumnRenamed(
            "count(count_events)", "count_events")
        grouped_agg = self._set_logged_datetime(grouped_agg)
        grouped_agg = self._set_processed_datetime(grouped_agg)
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(grouped_agg,"fh_stg_trfc_mis_req_frm_blip_dy_a","append")
        print("fh_stg_trfc_mis_req_frm_blip_dy_a successfully loaded")
        del grouped_agg,filtered_df,grouped_df

    def _extract_mis_responses_to_blacklisted_ip_event(self):
        blacklisted_ip_from_db = self._create_spark_dateframe_from_table("core_blacklistedip"
        ).select("ip_address").withColumnRenamed("ip_address","destination_address")
        filtered_df = self._df.join(blacklisted_ip_from_db, ["destination_address"], "leftanti")
        COLUMN_HEADERS = ['processed_datetime', 'logged_datetime', 'firewall_rule_id', 'source_address', 
                          'destination_address', 'application','protocol', 'source_zone', 'destination_zone', 
                          'inbound_interface', 'outbound_interface','action', 'category', 'session_end_reason', 
                          'destination_port','avg_repeat_count', 'sum_bytes_sent', 'sum_bytes_received', 'sum_packets_received', 
                          'sum_packets_sent','sum_time_elapsed', 'count_events']
        GROUPING_COLUMNS = ['processed_datetime','logged_datetime', 'firewall_rule_id', 'source_address', 'destination_address', 'application',
                          'protocol', 'source_zone', 'destination_zone', 'inbound_interface', 'outbound_interface',
                          'action', 'category', 'session_end_reason','destination_port']
        grouped_df = filtered_df.groupby(*GROUPING_COLUMNS)
        grouped_agg = grouped_df.agg({
            'repeat_count': 'mean',
            'bytes_sent': 'sum',
            'bytes_received': 'sum',
            'time_elapsed': 'sum',
            'packets_sent': 'sum',
            'packets_received': 'sum',
            'count_events': 'count'})
        grouped_agg = grouped_agg.withColumnRenamed(
            "sum(time_elapsed)", "sum_time_elapsed").withColumnRenamed(
            "sum(bytes_received)", "sum_bytes_received").withColumnRenamed(
            "sum(packets_received)", "sum_packets_received").withColumnRenamed(
            "sum(packets_sent)", "sum_packets_sent").withColumnRenamed(
            "avg(repeat_count)", "avg_repeat_count").withColumnRenamed(
            "sum(bytes_sent)", "sum_bytes_sent").withColumnRenamed(
            "count(count_events)", "count_events")
        grouped_agg = self._set_logged_datetime(grouped_agg)
        grouped_agg = self._set_processed_datetime(grouped_agg)
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(grouped_agg,"fh_stg_trfc_mis_res_to_blip_dy_a","append")
        print("fh_stg_trfc_mis_res_to_blip_dy_a successfully loaded")
        del grouped_agg,filtered_df,grouped_df
        
        
    def run(self):
        logger = Logger.getInstance()
        self._read_csv()
        logger.info(f'Daily Traffic MIS Engine: {self._INPUT_TRAFFIC_LOG}')
        self._preprocess()
        logger.info(f'log sucessfullly loaded')
        self._write_new_firewall_rules_to_db()
        logger.info(f'fh_prd_fw_rule_f successfully loaded')
        self._set_firewall_rules_id_to_data()
        self._extract_mis_daily()
        logger.info(f'fh_stg_trfc_mis_dy_a successfully loaded')
        self._extract_mis_new_source_address()
        logger.info(f"fh_stg_trfc_mis_new_src_ip_dy_a successfully loaded")
        self._extract_mis_new_destination_address()
        logger.info(f"fh_stg_trfc_mis_new_dst_ip_dy_a successfully loaded")
        self._extract_mis_new_application()
        logger.info(f"fh_stg_trfc_mis_new_app_dy_a successfully loaded")
        self._extract_mis_requests_from_blacklisted_ip_event()
        logger.info(f"fh_stg_trfc_mis_req_frm_blip_dy_a successfully loaded")
        self._extract_mis_responses_to_blacklisted_ip_event()
        logger.info(f"fh_stg_trfc_mis_res_to_blip_dy_a successfully loaded")
