from pyspark.sql.functions import unix_timestamp, from_unixtime, to_timestamp, current_date, current_timestamp
from pyspark.sql.types import StructField, StructType,BooleanType, DoubleType, LongType, StringType, IntegerType, DateType, TimestampType
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
import geoip2.database
import geoip2.errors
import config as py_config

from ..logger import Logger
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

COUNTRY_DB_FILEPATH = py_config.COUNTRY_DB_FILEPATH

class DailyTrafficLogEngine:
    def __init__(self, input_traffic_log,output_dir,country_db_file,db_engine, spark):
        self._INPUT_TRAFFIC_LOG = input_traffic_log
        self._country_db_file = country_db_file
        self._db_engine = db_engine
        self._spark = spark
        self._REQUIRED_COLUMNS = ['Start Time','Threat/Content Type','Source address', 'Destination address','NAT Source IP',
                                  'NAT Destination IP','Application','Log Action',
                                  'NAT Destination Port','Rule','Flags','IP Protocol', 'Source Zone', 'Destination Zone', 
                                  'Inbound Interface', 'Outbound Interface', 'Action', 'Category',
                                  'Session End Reason',  'Destination Port',
                                  'Bytes Sent', 'Bytes Received', 'Repeat Count', 'Packets Received', 
                                  'Packets Sent','Start Time', 'Elapsed Time (sec)', 'Virtual System', 'Device Name']
        self._HEADER_NAMES = ['start_time',"threat_content_type","source_address", "destination_address",'nat_source_ip',
                              "nat_destination_ip", "application","log_action",
                              "nat_destination_port","firewall_rule","flags","protocol", "source_zone", "destination_zone", 
                              "inbound_interface", "outbound_interface", "action", "category",
                              "session_end_reason","destination_port",
                              "bytes_sent", "bytes_received", "repeat_count", "packets_received",
                              "packets_sent", "logged_datetime", "time_elapsed", 'vsys','device_name']


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

    def _get_date_from_csv_filename(self, filename):
        d = re.findall(r'[0-9]{4}_[0-9]{2}_[0-9]{2}',
                       filename)[0].replace("_", "/")
        return self.str_to_date(d)

    def _read_csv(self):
        print(f"reading file {self._INPUT_TRAFFIC_LOG}")
        self._CSV_DATE = self._get_date_from_csv_filename(self._INPUT_TRAFFIC_LOG)
        self._df = self._spark.read.csv(self._INPUT_TRAFFIC_LOG, header=True)

    def _read_firewall_rules_from_db(self):
        return pd.read_sql_table('fh_prd_fw_rule_f', self._db_engine).set_index("name").to_dict()["id"]

    def _read_traffic_logs_from_db(self):
        return pd.read_sql_table('fh_prd_trfc_log_f', self._db_engine).set_index("log_name").to_dict()["id"]
    
        
    def _set_firewall_rules_id_to_data(self):
        firewall_rules_from_db = self._read_firewall_rules_from_db()
        
        @F.udf(returnType=IntegerType())
        def setFirewallRulesIdUdf(x):
            return firewall_rules_from_db[x]
        
        self._df = self._df.withColumn("firewall_rule_id", setFirewallRulesIdUdf(self._df.firewall_rule))

    def _set_traffic_log_id_to_data(self):
        traffic_lofs_from_db = self._read_traffic_logs_from_db()
        self._df = self._df.withColumn('log_name',lit(self._INPUT_TRAFFIC_LOG))
        
        @F.udf(returnType=IntegerType())
        def setTrafficLogsIdUdf(x):
            return traffic_lofs_from_db[x]
        
        self._df = self._df.withColumn("traffic_log_id", setTrafficLogsIdUdf(self._df.log_name))

    def _resolve_ip_country(self):
        @F.udf(returnType=StringType())
        def getCountryNameFromIpUdf(ip_address):
            if ipaddress.ip_address(ip_address).is_private:
                return "np"
            reader = geoip2.database.Reader(COUNTRY_DB_FILEPATH)
            try:
                response = reader.city(ip_address)
                return response.country.iso_code.lower()
            except geoip2.errors.AddressNotFoundError:
                return "unk"
            except AttributeError:
                print("*****"*20)
                print(response.country)
                print(response.country.iso_code)
                print("*****"*20)
                return "unk"
        self._df = self._df.withColumn("source_country", getCountryNameFromIpUdf(self._df.source_address))
        self._df = self._df.withColumn("destination_country",getCountryNameFromIpUdf(self._df.destination_address))
        

    def _preprocess(self):
        self._df = self._df[self._REQUIRED_COLUMNS]
        self._df = self._df.toDF(*self._HEADER_NAMES)
        self._df = self._df.withColumn('start_time_hour', to_timestamp(self._df["start_time"],"MM/dd/YYYY HH"))
        self._df = self._df.withColumn('start_time_day', to_timestamp(self._df["start_time"],"MM/dd/YYYY"))
        self._df = self._df.withColumn("destination_port", self._df["nat_destination_port"].cast(IntegerType()))
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
    
    def _write_log_to_traffic_logs(self):
        data = [(self._CSV_DATE,self._INPUT_TRAFFIC_LOG)]
        log = self._spark.createDataFrame(data, ['log_date','log_name'])
        log = log.withColumn('log_date',to_timestamp(log.log_date,'yyyy/MM/dd'))
        log = log.withColumn('processed_datetime', lit(datetime.datetime.today()))
        self._write_df_to_postgres(log,'fh_prd_trfc_log_f','append')
        print("fh_prd_trfc_log_f successfully loaded")

    
    def _extract_traffic_log_details(self):
        log_name = self._INPUT_TRAFFIC_LOG
        grouped = self._df.groupby('firewall_rule_id').count(
            ).withColumn('log', lit(log_name)).withColumnRenamed('count', 'rows')
        grouped.withColumn('processed_datetime', lit(datetime.datetime.today()))
        self._write_df_to_postgres(grouped,'fh_stg_trfc_log_dtl_f','append')
        print("fh_prd_trfc_log_f successfully loaded")

    
    def _extract_traffic_logs_details_hourly(self):
        GROUPING_COLUMNS = ["start_time_hour","threat_content_type","source_address", "destination_address",
                            'nat_source_ip',"nat_destination_ip", "application","log_action",
                            "destination_port","nat_destination_port","firewall_rule",
                            "flags","protocol", "source_zone","destination_zone",
                            "inbound_interface", "outbound_interface", "action",
                            "category","session_end_reason",'vsys','device_name']
        COLUMN_HEADERS = ["start_time","threat_content_type","source_address", "destination_address",
                            'nat_source_ip',"nat_destination_ip", "application","log_action",
                            "destination_port","nat_destination_port","firewall_rule",
                            "flags","protocol", "source_zone","destination_zone",
                            "inbound_interface", "outbound_interface", "action",
                            "category","session_end_reason",'vsys','device_name','sum_time_elapsed',
                          'sum_bytes_received','sum_packets_received','sum_packets_sent','avg_repeat_count',
                          'sum_bytes_sent','count_events']
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
            "count(count_events)", "count_events").withColumnRenamed("start_time_hour", "start_time")
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(grouped_agg,'fh_stg_trfc_log_dtl_hr_a','append')
        print("fh_stg_trfc_log_dtl_hr_a successfully loaded")
    
    def _extract_traffic_logs_details_daily(self):
        GROUPING_COLUMNS = ["start_time_day","threat_content_type","source_address", "destination_address",
                            'nat_source_ip',"nat_destination_ip", "application","log_action",
                            "destination_port","nat_destination_port","firewall_rule",
                            "flags","protocol", "source_zone","destination_zone",
                            "inbound_interface", "outbound_interface", "action",
                            "category","session_end_reason",'vsys','device_name']
        COLUMN_HEADERS = ["start_time","threat_content_type","source_address", "destination_address",
                            'nat_source_ip',"nat_destination_ip", "application","log_action",
                            "destination_port","nat_destination_port","firewall_rule",
                            "flags","protocol", "source_zone","destination_zone",
                            "inbound_interface", "outbound_interface", "action",
                            "category","session_end_reason",'vsys','device_name','sum_time_elapsed',
                          'sum_bytes_received','sum_packets_received','sum_packets_sent','avg_repeat_count',
                          'sum_bytes_sent','count_events']
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
            "count(count_events)", "count_events").withColumnRenamed("start_time_day", "start_time")
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(grouped_agg,'fh_stg_trfc_log_dtl_dy_a','append')
        print("fh_stg_trfc_log_dtl_dy_a successfully loaded")
    
    
    def run(self):
        self._read_csv()
        self._preprocess()
        self._set_firewall_rules_id_to_data()
        self._set_traffic_log_id_to_data()
        self._write_log_to_traffic_logs()
        self._extract_traffic_log_details()
        self._resolve_ip_country()
        self._extract_traffic_logs_details_hourly()
        self._extract_traffic_logs_details_daily()
