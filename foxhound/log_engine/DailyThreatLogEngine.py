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

class DailyThreatLogEngine:
    def __init__(self, input_threat_log,output_dir,country_db_file,db_engine, spark):
        self._INPUT_THREAT_LOG = input_threat_log
        self._country_db_file = country_db_file
        self._db_engine = db_engine
        self._spark = spark
        self._REQUIRED_COLUMNS = [
            'Receive Time', 'Type', 'Threat/Content Type', 'Config Version',
            'Source address', 'Destination address','NAT Source IP','NAT Destination IP', 'Rule', 'Application',
            'Virtual System', 'Source Zone','Destination Zone', 'Inbound Interface', 'Outbound Interface',
            'Log Action','Repeat Count', 'Source Port', 'Destination Port','NAT Source Port','NAT Destination Port',
            'Flags','IP Protocol', 'Action','URL/Filename', 'Threat/Content Name', 'Category', 'Severity',
            'Direction', 'Sequence Number', 'Action Flags', 'Source Country',
            'Destination Country', 'cpadding', 'contenttype', 'url_idx',
            'Device Name','file_url', 'thr_category', 'contentver', 'sig_flags']

        self._COLUMN_HEADERS = [
            'received_datetime', 'log_type', 'threat_content_type','config_version', 
            'source_address', 'destination_address','nat_source_ip','nat_destination_ip','firewall_rule', 'application',
            'virtual_system','source_zone', 'destination_zone', 'inbound_interface','outbound_interface',
            'log_action','repeat_count','source_port','destination_port','nat_source_port','nat_destination_port',
            'flags','protocol', 'action', 'url_filename','threat_content_name', 'category', 'severity',
            'direction','sequence_number', 'action_flags', 'source_country',
            'destination_country', 'cpadding','contenttype', 'url_idx', 
            'device_name', 'file_url','thr_category', 'contentver', 'sig_flags']

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
        print(f"reading file {self._INPUT_THREAT_LOG}")
        self._CSV_DATE = self._get_date_from_csv_filename(self._INPUT_THREAT_LOG)
        self._df = self._spark.read.csv(self._INPUT_THREAT_LOG, header=True)

    def _read_firewall_rules_from_db(self):
        return pd.read_sql_table('fh_prd_fw_rule_f', self._db_engine).set_index("name").to_dict()["id"]

    def _read_threat_logs_from_db(self):
        return pd.read_sql_table('fh_prd_thrt_log_f', self._db_engine).set_index("log_name").to_dict()["id"]
    
        
    def _set_firewall_rules_id_to_data(self):
        self._df = self._df.fillna({'firewall_rule':'default'})
        firewall_rules_from_db = self._read_firewall_rules_from_db()
        
        @F.udf(returnType=IntegerType())
        def setFirewallRulesIdUdf(x):
            return firewall_rules_from_db[x]
        
        self._df = self._df.withColumn("firewall_rule_id", setFirewallRulesIdUdf(self._df.firewall_rule))

    def _set_threat_log_id_to_data(self):
        threat_lofs_from_db = self._read_threat_logs_from_db()
        self._df = self._df.withColumn('log_name',lit(self._INPUT_THREAT_LOG))
        
        @F.udf(returnType=IntegerType())
        def setThreatLogsIdUdf(x):
            return threat_lofs_from_db[x]
        
        self._df = self._df.withColumn("threat_log_id", setThreatLogsIdUdf(self._df.log_name))

    def _resolve_ip_country(self):
        @F.udf(returnType=StringType())
        def getCountryNameFromIpUdf(ip_address):
            reader = geoip2.database.Reader(COUNTRY_DB_FILEPATH)
            if ipaddress.ip_address(ip_address).is_private:
                return "np"
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
        self._df = self._df.toDF(*self._COLUMN_HEADERS)
        self._df = self._df.withColumn("received_datetime", to_timestamp(self._df.received_datetime, 'yyyy/MM/dd'))
        self._df = self._df.withColumn("nat_source_port", self._df["nat_source_port"].cast(IntegerType()))
        self._df = self._df.withColumn("source_port", self._df["source_port"].cast(IntegerType()))
        self._df = self._df.withColumn("nat_destination_port", self._df["nat_destination_port"].cast(IntegerType()))
        self._df = self._df.withColumn("destination_port", self._df["destination_port"].cast(IntegerType()))
        self._df = self._df.withColumn("repeat_count", self._df["repeat_count"].cast(LongType()))
    
    def _write_log_to_threat_logs(self):
        data = [(self._CSV_DATE,self._INPUT_THREAT_LOG)]
        log = self._spark.createDataFrame(data, ['log_date','log_name'])
        log = log.withColumn('log_date',to_timestamp(log.log_date,'yyyy/MM/dd HH:mm:ss'))
        log = log.withColumn('processed_datetime', lit(datetime.datetime.today()))
        self._write_df_to_postgres(log,'fh_prd_thrt_log_f','append')
        print("fh_prd_thrt_log_f successfully loaded")

    
    def _extract_threat_log_details(self):
        log_name = self._INPUT_THREAT_LOG
        grouped = self._df.groupby('firewall_rule_id').count(
            ).withColumn('log', lit(log_name)).withColumnRenamed('count', 'rows')
        grouped.withColumn('processed_datetime', lit(datetime.datetime.today()))
        self._write_df_to_postgres(grouped,'fh_stg_thrt_log_dtl_f','append')
        print("fh_stg_thrt_log_dtl_f successfully loaded")

    
    def _extract_threat_logs_details_event(self):
        COLUMN_HEADERS = [
            'threat_log_id','received_datetime', 'log_type', 'threat_content_type','config_version', 
            'source_address', 'destination_address','nat_source_ip','nat_destination_ip','firewall_rule_id', 'application',
            'virtual_system','source_zone', 'destination_zone', 'inbound_interface','outbound_interface',
            'log_action','repeat_count','source_port','destination_port','nat_source_port','nat_destination_port',
            'flags','protocol', 'action', 'url_filename','threat_content_name', 'category', 'severity',
            'direction','sequence_number', 'action_flags', 'source_country',
            'destination_country', 'cpadding','contenttype', 'url_idx', 
            'device_name', 'file_url','thr_category', 'contentver', 'sig_flags']
        self._df = self._df.select(*COLUMN_HEADERS)
        self._write_df_to_postgres(self._df,'fh_stg_thrt_log_dtl_evnt_f','append')
        print("fh_stg_thrt_log_dtl_evnt_f successfully loaded")
    
    def run(self):
        self._read_csv()
        self._preprocess()
        self._set_firewall_rules_id_to_data()
        self._resolve_ip_country()         
        self._write_log_to_threat_logs()
        self._set_threat_log_id_to_data()
        self._extract_threat_log_details()
        self._extract_threat_logs_details_event()
