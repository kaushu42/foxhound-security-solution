from pyspark.sql.functions import unix_timestamp, from_unixtime, to_timestamp, current_date, current_timestamp
from pyspark.sql.types import StructField, StructType, DoubleType, LongType, StringType, IntegerType, DateType, TimestampType
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


class MISEngine(object):
    def __init__(self, spark_session, db_engine, input_dir, output_dir):
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        self._spark = spark_session
        self._db_engine = db_engine
        self._INPUT_DIR = input_dir
        self._OUTPUT_DIR = output_dir
        self._REQUIRED_COLUMNS = ['Source address', 'Destination address', 'Application',
                                  'IP Protocol', 'Source Zone', 'Destination Zone', 'Rule',
                                  'Inbound Interface', 'Outbound Interface', 'Action', 'Category',
                                  'Session End Reason', 'Sequence Number', 'Source Port', 'Destination Port',
                                  'Bytes Sent', 'Bytes Received', 'Repeat Count', 'Packets Received', 'Packets Sent',
                                  'Start Time', 'Elapsed Time (sec)', 'Virtual System']
        self._HEADER_NAMES = ["source_ip", "destination_ip", "application",
                              "protocol", "source_zone", "destination_zone", "firewall_rule",
                              "inbound_interface", "outbound_interface", "action", "category",
                              "session_end_reason", "row_number", "source_port", "destination_port",
                              "bytes_sent", "bytes_received", "repeat_count", "packets_received",
                              "packets_sent", "logged_datetime", "time_elapsed", 'vsys']

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

    def _generate_df_schema_from_table(self, table_name):
        columns, column_types = self._get_column_names_types(table_name)
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
        return schema

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

    def _get_date_from_csv_filename(self, csv_filename):
        d = re.findall(r'[0-9]{4}_[0-9]{2}_[0-9]{2}',
                       csv_filename)[0].replace("_", "/")
        print(f'csv date obtained: {d}')
        return d

    def _read_csv(self, csv_filename: str):
        print(f"reading file {csv_filename}")
        self._csv_filename = csv_filename
        self._CSV_DATE = self._get_date_from_csv_filename(csv_filename)
        self._df = self._spark.read.csv(os.path.join(
            self._INPUT_DIR, csv_filename), header=True)

    def _get_table(self, table_name):
        return pd.read_sql_table(table_name, self._db_engine)

    def _preprocess(self):
        self._df = self._df[self._REQUIRED_COLUMNS]
        self._df = self._df.toDF(*self._HEADER_NAMES)
        self._df = self._df.withColumn("logged_datetime", to_timestamp(
            self._df.logged_datetime, 'yyyy/MM/dd'))
        self._df = self._df.withColumn(
            "row_number", self._df["row_number"].cast(LongType()))
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
        return self._df

    def _write_csv_to_postgres(self, df, table_name, mode):
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

    def _write_csv_to_cassandra(self, df, table_name, mode):
        df.write.format(SPARK_CASDB_DRIVER).mode(
            mode).options(
            table=table_name, keyspace=CAS_KEYSPACE).save()
        del df

    def _write_new_firewall_rules_to_db(self):
        firewall_rules_schema = StructType([
            StructField("id", IntegerType(), True),
            StructField("name", StringType(), True),
            StructField("tenant_id", IntegerType(), True)])
        firewall_rules_from_db = self._get_table("core_firewallrule")
        firewall_rules_from_db = self._spark.createDataFrame(
            firewall_rules_from_db, firewall_rules_schema).select("name")
        firewall_rules_from_csv = self._df.select("firewall_rule").distinct()
        new_firewall_rules = firewall_rules_from_csv.subtract(
            firewall_rules_from_db).toDF(*["name"])
        new_firewall_rules = new_firewall_rules.withColumn("tenant_id", lit(1))
        self._write_csv_to_postgres(
            new_firewall_rules, "core_firewallrule", "append")

    def _read_firewall_rules_from_db(self):
        return pd.read_sql_table('core_firewallrule', self._db_engine).set_index("name").to_dict()["id"]

    @staticmethod
    def _set_firewall_rules_id_to_data(df, firewall_rules_from_db):
        setFirewallRulesIdUdf = udf(
            lambda x: firewall_rules_from_db[x], IntegerType())
        return df.withColumn("firewall_rule_id", setFirewallRulesIdUdf(df.firewall_rule))

    @staticmethod
    def _set_uuid(df):
        uuidUdf = udf(lambda: str(uuid.uuid4()), StringType())
        df = df.withColumn("id", uuidUdf())
        return df

    @staticmethod
    def _to_public_address(df):
        toPublicAddressUdf = udf(lambda x: x if ipaddress.ip_address(
            x).is_private else "Public Address", StringType())
        public_grouped_df = df.withColumn(
            "source_ip", toPublicAddressUdf(df.source_ip))
        public_grouped_df = public_grouped_df.withColumn(
            "destination_ip", toPublicAddressUdf(df.destination_ip))
        return public_grouped_df

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

    def _extract_mis_daily(self, df):
        GROUPING_COLUMNS = ['logged_datetime', 'firewall_rule_id',
                            'source_zone', 'destination_zone', 'application', 'protocol']
        COLUMN_HEADERS = ['id', 'processed_datetime', 'logged_datetime', 'source_zone', 'destination_zone', 'application', 'protocol',
                          'avg_repeat_count', 'sum_bytes_sent', 'sum_bytes_received', 'sum_packets_received', 'sum_packets_sent',
                          'sum_time_elapsed', 'count_events', 'firewall_rule_id']
        grouped_df = df.groupby(*GROUPING_COLUMNS)
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
        grouped_agg = self._set_processed_datetime(grouped_agg)
        grouped_agg = self._set_uuid(grouped_agg)
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        del grouped_df
        return grouped_agg

    def _extract_mis_new_source_ip(self, df):
        ip_from_db_df = self._create_spark_dateframe_from_table("mis_dailysourceip"
                                                                ).select("firewall_rule_id", "source_address"
                                                                         ).toDF(*["firewall_rule_id", "source_ip"])
        source_ip_from_csv = [i for i in df.select('firewall_rule_id', 'source_ip'
                                                   ).distinct().collect() if ipaddress.ip_address(i.source_ip).is_private]
        unique_source_ip_from_csv_df = self._spark.createDataFrame(
            source_ip_from_csv)
        new_unique_source_ip = unique_source_ip_from_csv_df.subtract(ip_from_db_df
                                                                     ).toDF(*["firewall_rule_id", "source_address"])
        COLUMN_HEADERS = ["id", "processed_datetime",
                          "logged_datetime", "source_address", "firewall_rule_id"]
        new_unique_source_ip = self._set_logged_datetime(new_unique_source_ip)
        new_unique_source_ip = self._set_uuid(new_unique_source_ip)
        new_unique_source_ip = self._set_processed_datetime(
            new_unique_source_ip)
        new_unique_source_ip = new_unique_source_ip.select(*COLUMN_HEADERS)
        return new_unique_source_ip

    def _extract_mis_new_destination_ip(self, df):
        ip_from_db_df = self._create_spark_dateframe_from_table("mis_dailydestinationip"
                                                                ).select("firewall_rule_id", "destination_address"
                                                                         ).toDF(*["firewall_rule_id", "destination_ip"])

        destination_ip_from_csv = [i for i in df.select('firewall_rule_id', 'destination_ip'
                                                        ).distinct().collect() if ipaddress.ip_address(i.destination_ip).is_private]

        unique_destination_ip_from_csv_df = self._spark.createDataFrame(
            destination_ip_from_csv)

        new_unique_destination_ip = unique_destination_ip_from_csv_df.subtract(ip_from_db_df
                                                                               ).toDF(*["firewall_rule_id", "destination_address"])

        COLUMN_HEADERS = ["id", "processed_datetime",
                          "logged_datetime", "destination_address", "firewall_rule_id"]

        new_unique_destination_ip = self._set_logged_datetime(
            new_unique_destination_ip)
        new_unique_destination_ip = self._set_uuid(new_unique_destination_ip)
        new_unique_destination_ip = self._set_processed_datetime(
            new_unique_destination_ip)
        new_unique_destination_ip = new_unique_destination_ip.select(
            *COLUMN_HEADERS)
        return new_unique_destination_ip

    def _extract_mis_new_application_ip(self, df):
        application_from_db_df = self._create_spark_dateframe_from_table("mis_dailyapplication"
                                                                         ).select("firewall_rule_id", "application_name"
                                                                                  ).toDF(*["firewall_rule_id", "application"])

        application_from_csv = [i for i in df.select(
            'firewall_rule_id', 'application').distinct().collect()]

        unique_application_from_csv_df = self._spark.createDataFrame(
            application_from_csv)

        new_unique_application = unique_application_from_csv_df.subtract(
            application_from_db_df).toDF(*["firewall_rule_id", "application_name"])

        COLUMN_HEADERS = ["id", "processed_datetime",
                          "logged_datetime", "application_name", "firewall_rule_id"]

        new_unique_application = self._set_logged_datetime(
            new_unique_application)
        new_unique_application = self._set_uuid(new_unique_application)
        new_unique_application = self._set_processed_datetime(
            new_unique_application)
        new_unique_application = new_unique_application.select(*COLUMN_HEADERS)
        return new_unique_application

    def _extract_mis_requests_from_blacklisted_ip_event(self, df):
        blacklisted_ip_from_db = self._get_table("core_blacklistedip")[
            "ip_address"].tolist()
        filtered_df = df.filter(col("source_ip").isin(blacklisted_ip_from_db))
        COLUMN_HEADERS = ['id', 'processed_datetime', 'logged_datetime', 'firewall_rule_id', 'source_ip', 'destination_ip', 'application',
                          'protocol', 'source_zone', 'destination_zone', 'inbound_interface', 'outbound_interface',
                          'action', 'category', 'session_end_reason', 'row_number', 'source_port', 'destination_port',
                          'bytes_sent', 'bytes_received', 'repeat_count', 'packets_received', 'packets_sent', 'time_elapsed']
        filtered_df = self._set_logged_datetime(filtered_df)
        filtered_df = self._set_uuid(filtered_df)
        filtered_df = self._set_processed_datetime(filtered_df)
        filtered_df = filtered_df.select(*COLUMN_HEADERS)
        return filtered_df

    def _extract_mis_responses_to_blacklisted_ip_event(self, df):
        blacklisted_ip_from_db = self._get_table("core_blacklistedip")[
            "ip_address"].tolist()
        filtered_df = df.filter(
            col("destination_ip").isin(blacklisted_ip_from_db))
        COLUMN_HEADERS = ['id', 'processed_datetime', 'logged_datetime', 'firewall_rule_id', 'source_ip', 'destination_ip', 'application',
                          'protocol', 'source_zone', 'destination_zone', 'inbound_interface', 'outbound_interface',
                          'action', 'category', 'session_end_reason', 'row_number', 'source_port', 'destination_port',
                          'bytes_sent', 'bytes_received', 'repeat_count', 'packets_received', 'packets_sent', 'time_elapsed']
        filtered_df = self._set_logged_datetime(filtered_df)
        filtered_df = self._set_uuid(filtered_df)
        filtered_df = self._set_processed_datetime(filtered_df)
        filtered_df = filtered_df.select(*COLUMN_HEADERS)
        return filtered_df

    def _extract_mis_new_private_source_destination_pair(self, df):
        GROUPING_COLUMNS = ["firewall_rule_id", "logged_datetime",
                            "destination_ip", "source_ip", "destination_port"]
        COLUMN_HEADERS = ['id', 'processed_datetime', 'logged_datetime', 'firewall_rule_id', 'source_ip', 'destination_ip', 'destination_port',
                          'avg_repeat_count', 'sum_bytes_sent', 'sum_bytes_received', 'sum_packets_received', 'sum_packets_sent',
                          'sum_time_elapsed', 'count_events']
        grouped_df = df.groupby(*GROUPING_COLUMNS)
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
        grouped_agg = self._set_uuid(grouped_agg)
        grouped_agg = self._set_processed_datetime(grouped_agg)
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        del grouped_df
        return grouped_agg

    def _save_csv(self, filename, df):
        csv_filename = self._csv_filename.split(".")[0]
        output_dir = self._OUTPUT_DIR
        if not os.path.exists(os.path.join(output_dir, csv_filename)):
            os.makedirs(os.path.join(output_dir, csv_filename))
        if os.path.exists(os.path.join(output_dir, csv_filename, filename)):
            os.remove(os.path.join(output_dir, csv_filename, filename))
        df.toPandas().to_csv(os.path.join(output_dir, csv_filename, filename), index=False)

    def _write_mis_to_postgres_cassandra(self):
        csv_filename = self._csv_filename.split(".")[0]
        output_dir = self._OUTPUT_DIR
        if not os.path.exists(os.path.join(output_dir, csv_filename)):
            print("error no outputas found")
            return

        mis_daily_csv = self._spark.read.csv(os.path.join(output_dir, csv_filename, "mis_daily.csv"),
                                             header=True,
                                             inferSchema=True)

        mis_new_source_ip_csv = self._spark.read.csv(os.path.join(output_dir, csv_filename, "mis_new_source_ip.csv"),
                                                     header=True,
                                                     inferSchema=True)

        mis_new_destination_ip_csv = self._spark.read.csv(os.path.join(output_dir, csv_filename, "mis_new_destination_ip.csv"),
                                                          header=True,
                                                          inferSchema=True)

        mis_new_application_csv = self._spark.read.csv(os.path.join(output_dir, csv_filename, "mis_new_application.csv"),
                                                       header=True,
                                                       inferSchema=True)

        mis_requests_from_blacklisted_ip_csv = self._spark.read.csv(os.path.join(output_dir, csv_filename, "mis_requests_from_blacklisted_ip.csv"),
                                                                    header=True,
                                                                    inferSchema=True)

        mis_response_to_blacklisted_ip_csv = self._spark.read.csv(os.path.join(output_dir, csv_filename, "mis_response_to_blacklisted_ip.csv"),
                                                                  header=True,
                                                                  inferSchema=True)

        mis_new_private_source_destination_pair_csv = self._spark.read.csv(os.path.join(output_dir, csv_filename, "mis_new_private_source_destination_pair.csv"),
                                                                           header=True,
                                                                           inferSchema=True)

        mis_daily_csv.printSchema()
        mis_daily_csv.show()
        mis_new_source_ip_csv.show()
        mis_new_destination_ip_csv.show()
        mis_new_application_csv.show()
        mis_requests_from_blacklisted_ip_csv.show()
        mis_response_to_blacklisted_ip_csv.show()
        mis_new_private_source_destination_pair_csv.show()

        self._write_csv_to_postgres(mis_daily_csv, "mis_daily", "append")
        print("*** mis daily written to db ****")

        self._write_csv_to_postgres(
            mis_new_source_ip_csv, "mis_dailysourceip", "append")
        print("*** mis daily new source ip to db ****")

        self._write_csv_to_postgres(
            mis_new_destination_ip_csv, "mis_dailydestinationip", "append")
        print("*** mis daily new destination ip to db ****")

        self._write_csv_to_postgres(
            mis_new_application_csv, "mis_dailyapplication", "append")
        print("*** mis daily new application to db ****")

        self._write_csv_to_postgres(
            mis_requests_from_blacklisted_ip_csv, "mis_dailyrequestfromblacklistevent", "append")
        print("*** mis daily request from blacklisted ip events to db ****")

        self._write_csv_to_postgres(
            mis_response_to_blacklisted_ip_csv, "mis_dailyresponsetoblacklistevent", "append")
        print("*** mis daily response to blacklisted ip events to  db ****")

        self._write_csv_to_postgres(
            mis_new_private_source_destination_pair_csv, "mis_dailypersourcedestinationpair", "append")
        print("*** mis daily private source destination pair db ****")

        # self._write_csv_to_cassandra(mis_daily_csv, "mis_daily", "append")
        # print("*** mis daily written to db ****")

        # self._write_csv_to_cassandra(
        #     mis_new_source_ip_csv, "mis_daily_source_ip", "append")
        # print("*** mis daily new source ip to db ****")

        # self._write_csv_to_cassandra(
        #     mis_new_destination_ip_csv, "mis_daily_destination_ip", "append")
        # print("*** mis daily new destination ip to db ****")

        # self._write_csv_to_cassandra(
        #     mis_new_application_csv, "mis_daily_application", "append")
        # print("*** mis daily new application to db ****")

        # self._write_csv_to_cassandra(
        #     mis_requests_from_blacklisted_ip_csv, "mis_daily_request_from_black_list_event", "append")
        # print("*** mis daily request from blacklisted ip events to db ****")

        # self._write_csv_to_cassandra(
        #     mis_response_to_blacklisted_ip_csv, "mis_daily_response_to_black_list_event", "append")
        # print("*** mis daily response to blacklisted ip events to  db ****")

        # self._write_csv_to_cassandra(
        #     mis_new_private_source_destination_pair_csv, "mis_daily_per_source_destination_pair", "append")
        # print("*** mis daily private source destination pair db ****")

    def run(self):
        for root, dirs, files in os.walk(self._INPUT_DIR):
            for file in files:
                if file.endswith(".csv"):
                    print(file)
                    self._read_csv(file)
                    df = self._preprocess()
                    self._write_new_firewall_rules_to_db()

                    firewall_rules_from_db = self._read_firewall_rules_from_db()
                    df = self._set_firewall_rules_id_to_data(
                        df, firewall_rules_from_db)
                    print("*** processing finished ****")
                    self._mis_daily = self._extract_mis_daily(df)
                    print("*** mis daily extractng finished ****")
                    self._mis_new_source_ip = self._extract_mis_new_source_ip(
                        df)
                    # self._mis_new_source_ip.show(5)
                    print("*** mis daily new source ip extracting finished ****")
                    self._mis_new_destination_ip = self._extract_mis_new_destination_ip(
                        df)
                    print("*** mis daily new destination ip extracting finished ****")
                    self._mis_new_application = self._extract_mis_new_application_ip(
                        df)
                    print("*** mis daily new application extracting finished ****")
                    self._mis_requests_from_blacklisted_ip = self._extract_mis_requests_from_blacklisted_ip_event(
                        df)
                    # self._mis_requests_from_blacklisted_ip.show(5)
                    print(
                        "*** mis daily new blacklist request extracting finished ****")
                    self._mis_response_to_blacklisted_ip = self._extract_mis_responses_to_blacklisted_ip_event(
                        df)
                    # self._mis_response_to_blacklisted_ip.show(5)
                    print(
                        "*** mis daily new blacklist response extracting finished ****")
                    self._mis_new_private_source_destination_pair = self._extract_mis_new_private_source_destination_pair(
                        df)
                    # self._mis_new_private_source_destination_pair.show(5)
                    print(
                        "*** mis daily new source destination extracting finished ****")

                    col, col_types = self._get_column_names_types("mis_daily")
                    self._mis_daily = self._mis_daily.select(*col)
                    self._save_csv("mis_daily.csv", self._mis_daily)
                    print("*** csv mis daily saved **** ")

                    col, col_types = self._get_column_names_types(
                        "mis_dailysourceip")
                    self._mis_new_source_ip = self._mis_new_source_ip.select(
                        *col)
                    self._save_csv("mis_new_source_ip.csv",
                                   self._mis_new_source_ip)
                    print("*** csv mis nwe source ip saved **** ")

                    col, col_types = self._get_column_names_types(
                        "mis_dailydestinationip")
                    self._mis_new_destination_ip = self._mis_new_destination_ip.select(
                        *col)
                    self._save_csv("mis_new_destination_ip.csv",
                                   self._mis_new_destination_ip)
                    print("*** csv mis destination ip saved **** ")

                    col, col_types = self._get_column_names_types(
                        "mis_dailyapplication")
                    self._mis_new_application = self._mis_new_application.select(
                        *col)
                    self._save_csv("mis_new_application.csv",
                                   self._mis_new_application)
                    print("*** csv mis application saved **** ")

                    col, col_types = self._get_column_names_types(
                        "mis_dailyrequestfromblacklistevent")
                    self._mis_requests_from_blacklisted_ip = self._mis_requests_from_blacklisted_ip.select(
                        *col)
                    self._save_csv("mis_requests_from_blacklisted_ip.csv",
                                   self._mis_requests_from_blacklisted_ip)
                    print("*** csv mis request from blacklisted ip saved **** ")

                    col, col_types = self._get_column_names_types(
                        "mis_dailyresponsetoblacklistevent")
                    self._mis_response_to_blacklisted_ip = self._mis_response_to_blacklisted_ip.select(
                        *col)
                    self._save_csv("mis_response_to_blacklisted_ip.csv",
                                   self._mis_response_to_blacklisted_ip)
                    print("*** csv mis request to blacklisted ip saved **** ")

                    col, col_types = self._get_column_names_types(
                        "mis_dailypersourcedestinationpair")
                    self._mis_new_private_source_destination_pair = self._mis_new_private_source_destination_pair.select(
                        *col)
                    self._save_csv("mis_new_private_source_destination_pair.csv",
                                   self._mis_new_private_source_destination_pair)
                    print("*** csv mis private source destination pair saved **** ")

                    self._write_mis_to_postgres_cassandra()
