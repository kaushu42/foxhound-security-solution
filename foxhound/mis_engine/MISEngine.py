from pyspark.sql.types import StructField, StructType, LongType, StringType, IntegerType, DateType, TimestampType
from pyspark.sql.functions import col, lit
from pyspark.sql.functions import unix_timestamp, from_unixtime, to_timestamp
import pyspark.sql.functions as F
from pyspark.sql.functions import udf
from pyspark.sql import SQLContext
from pyspark.sql import SparkSession
import os
import uuid
import findspark
import random
import ipaddress
import pandas as pd
from sqlalchemy import create_engine


class MISEngine(object):
    def __init__(self, spark_session, db_engine, input_dir, output_dir):
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

    def _read_csv(self, csv_filename: str):
        self._csv_filename = csv_filename
        self._df = self._spark.read.csv(os.path.join(
            self._INPUT_DIR, csv_filename), header=True)

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

    def _read_firewall_rules_from_db(self):
        return pd.read_sql_table('core_firewallrule', self._db_engine).set_index("name").to_dict()["id"]

    @staticmethod
    def _set_firewall_rules_id_to_data(df, firewall_rules_from_db):
        setFirewallRulesIdUdf = udf(
            lambda x: firewall_rules_from_db[x], IntegerType())
        # return df.withColumn("firewall_rule", setFirewallRulesIdUdf(df.firewall_rule))
        return df.withColumn("firewall_rule", lit(1))

    @staticmethod
    def _set_uuid(df):
        uuidUdf = udf(lambda: str(uuid.uuid4()), StringType())
        df_header = list(df.columns)
        df = df.withColumn("id", uuidUdf())
        df_header.insert(0, "id")
        df = df.select(df_header)
        return df

    def _extract_mis_daily(self, df):
        GROUPING_COLUMNS = ['logged_datetime', 'firewall_rule',
                            'source_zone', 'destination_zone', 'application', 'protocol']
        COLUMN_HEADERS = ['logged_datetime', 'firewall_rule', 'source_zone', 'destination_zone', 'application', 'protocol',
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
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        grouped_agg = self._set_uuid(grouped_agg)
        del grouped_df
        return grouped_agg

    def _get_table(self, table_name):
        return pd.read_sql_table(table_name, self._db_engine)

    def _extract_mis_new_source_ip(self, df):
        ip_from_db = self._get_table("core_tenantipaddressinfo")
        ip_from_db = pd.merge(
            ip_from_db,
            self._get_table("core_firewallrule").reset_index(),
            left_on="firewall_rule_id",
            right_on="id", how="inner")[["firewall_rule_id", "address"]].drop_duplicates()
        ip_from_db_df = self._spark.createDataFrame(ip_from_db)
        source_ip = [i for i in df.select('firewall_rule', 'source_ip').distinct(
        ).collect() if ipaddress.ip_address(i.source_ip).is_private]
        unique_source_ip_df = self._spark.createDataFrame(source_ip)
        new_unique_source_ip = unique_source_ip_df.subtract(ip_from_db_df)
        # COLUMN_HEADERS = ["logged_datetime","address","firewall_rule"]
        COLUMN_HEADERS = ["source_ip", "firewall_rule"]
        new_unique_source_ip = new_unique_source_ip.select(*COLUMN_HEADERS)
        new_unique_source_ip = self._set_uuid(new_unique_source_ip)
        return new_unique_source_ip

    def _extract_mis_new_destination_ip(self, df):
        ip_from_db = self._get_table("core_tenantipaddressinfo")
        ip_from_db = pd.merge(
            ip_from_db,
            self._get_table("core_firewallrule").reset_index(),
            left_on="firewall_rule_id",
            right_on="id", how="inner")[["firewall_rule_id", "address"]].drop_duplicates()
        ip_from_db_df = self._spark.createDataFrame(ip_from_db)
        destination_ip = [i for i in df.select('firewall_rule', 'destination_ip').distinct(
        ).collect() if ipaddress.ip_address(i.destination_ip).is_private]
        unique_destination_ip_df = self._spark.createDataFrame(destination_ip)
        new_unique_destination_ip = unique_destination_ip_df.subtract(
            ip_from_db_df)
        # COLUMN_HEADERS = ["logged_datetime","address","firewall_rule"]
        COLUMN_HEADERS = ["destination_ip", "firewall_rule"]
        new_unique_destination_ip = new_unique_destination_ip.select(
            *COLUMN_HEADERS)
        new_unique_destination_ip = self._set_uuid(new_unique_destination_ip)
        return new_unique_destination_ip

    def _extract_mis_new_application_ip(self, df):
        application_from_db = self._get_table("core_tenantapplicationinfo")
        application_from_db = pd.merge(
            application_from_db,
            self._get_table("core_firewallrule").reset_index(),
            left_on="firewall_rule_id",
            right_on="id", how="inner")[["firewall_rule_id", "application"]].drop_duplicates()
        application_from_db_df = self._spark.createDataFrame(
            application_from_db)
        application = [i for i in df.select(
            'firewall_rule', 'application').distinct().collect()]
        unique_application_df = self._spark.createDataFrame(application)
        new_unique_application = unique_application_df.subtract(
            application_from_db_df)
        # COLUMN_HEADERS = ["logged_datetime","address","firewall_rule"]
        COLUMN_HEADERS = ["application", "firewall_rule"]
        new_unique_application = new_unique_application.select(*COLUMN_HEADERS)
        new_unique_application = self._set_uuid(new_unique_application)
        return new_unique_application

    def _extract_mis_requests_from_blacklisted_ip_event(self, df):
        blacklisted_ip_from_db = self._get_table("core_blacklistedip")[
            "ip_address"].tolist()
        filtered_df = df.filter(col("source_ip").isin(blacklisted_ip_from_db))
        COLUMN_HEADERS = ['logged_datetime', 'firewall_rule', 'source_ip', 'destination_ip', 'application',
                          'protocol', 'source_zone', 'destination_zone', 'inbound_interface', 'outbound_interface',
                          'action', 'category', 'session_end_reason', 'row_number', 'source_port', 'destination_port',
                          'bytes_sent', 'bytes_received', 'repeat_count', 'packets_received', 'packets_sent', 'time_elapsed']
        filtered_df = filtered_df.select(*COLUMN_HEADERS)
        filtered_df = self._set_uuid(filtered_df)
        return filtered_df

    def _extract_mis_responses_to_blacklisted_ip_event(self, df):
        blacklisted_ip_from_db = self._get_table("core_blacklistedip")[
            "ip_address"].tolist()
        filtered_df = df.filter(
            col("destination_ip").isin(blacklisted_ip_from_db))
        COLUMN_HEADERS = ['logged_datetime', 'firewall_rule', 'source_ip', 'destination_ip', 'application',
                          'protocol', 'source_zone', 'destination_zone', 'inbound_interface', 'outbound_interface',
                          'action', 'category', 'session_end_reason', 'row_number', 'source_port', 'destination_port',
                          'bytes_sent', 'bytes_received', 'repeat_count', 'packets_received', 'packets_sent', 'time_elapsed']
        filtered_df = filtered_df.select(*COLUMN_HEADERS)
        filtered_df = self._set_uuid(filtered_df)
        return filtered_df

    @staticmethod
    def _to_public_address(df):
        toPublicAddressUdf = udf(lambda x: x if ipaddress.ip_address(
            x).is_private else "Public Address", StringType())
        public_grouped_df = df.withColumn(
            "source_ip", toPublicAddressUdf(df.source_ip))
        public_grouped_df = public_grouped_df.withColumn(
            "destination_ip", toPublicAddressUdf(df.destination_ip))
        return public_grouped_df

    def _extract_mis_new_private_source_destination_pair(self, df):
        GROUPING_COLUMNS = ["firewall_rule", "logged_datetime",
                            "destination_ip", "source_ip", "destination_port"]
        COLUMN_HEADERS = ['logged_datetime', 'firewall_rule', 'source_ip', 'destination_ip', 'destination_port',
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
        grouped_agg = grouped_agg.select(*COLUMN_HEADERS)
        grouped_agg = self._set_uuid(grouped_agg)
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

    def run(self):
        self._read_csv(
            "Silverlining-PAVM-Primary_traffic_2019_11_05_last_calendar_day.csv")
        df = self._preprocess()
        firewall_rules_from_db = self._read_firewall_rules_from_db()
        df = self._set_firewall_rules_id_to_data(df, firewall_rules_from_db)
        print("*** processing finished ****")
        self._mis_daily = self._extract_mis_daily(df)
        print("*** mis daily extractng finished ****")
        self._mis_new_source_ip = self._extract_mis_new_source_ip(df)
        print("*** mis daily new source ip extracting finished ****")
        self._mis_new_destination_ip = self._extract_mis_new_destination_ip(df)
        print("*** mis daily new destination ip extracting finished ****")
        self._mis_new_application = self._extract_mis_new_application_ip(df)
        print("*** mis daily new application extracting finished ****")
        self._mis_requests_from_blacklisted_ip = self._extract_mis_requests_from_blacklisted_ip_event(
            df)
        print("*** mis daily new blacklist request extracting finished ****")
        self._mis_response_to_blacklisted_ip = self._extract_mis_responses_to_blacklisted_ip_event(
            df)
        print("*** mis daily new blacklist response extracting finished ****")
        self._mis_new_private_source_destination_pair = self._extract_mis_new_private_source_destination_pair(
            df)
        print("*** mis daily new source destination extracting finished ****")
        self._save_csv("mis_daily.csv", self._mis_daily)
        self._save_csv("mis_new_source_ip.csv", self._mis_new_source_ip)
        self._save_csv("mis_new_destination_ip.csv",
                       self._mis_new_destination_ip)
        self._save_csv("mis_new_application.csv", self._mis_new_application)
        self._save_csv("mis_requests_from_blacklisted_ip.csv",
                       self._mis_requests_from_blacklisted_ip)
        self._save_csv("mis_response_to_blacklisted_ip.csv",
                       self._mis_response_to_blacklisted_ip)
        self._save_csv("mis_new_private_source_destination_pair.csv",
                       self._mis_new_private_source_destination_pair)
        print("finished")
