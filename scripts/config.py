from pyspark.sql import SparkSession
import os
import findspark

from ConfigParser import ConfigParser
import ast

config = ConfigParser()
config.read('../config.ini')

PG_DRIVER = ast.literal_eval(config.get("SPARK", "PG_DRIVER"))
SPARK_MASTER_URL = ast.literal_eval(config.get("SPARK", "SPARK_MASTER_URL"))
CLUSTER_SEEDS = ast.literal_eval(config.get("SPARK", "CLUSTER_SEEDS"))
SPARK_APP_NAME = ast.literal_eval(config.get("SPARK", "SPARK_APP_NAME"))

os.environ['PYSPARK_SUBMIT_ARGS'] = PG_DRIVER

findspark.init()


def create_directory(path):
    if not os.path.exists(path):
        os.mkdir(path)


os.environ['PYSPARK_SUBMIT_ARGS'] = '--packages org.postgresql:postgresql:42.1.1 pyspark-shell'

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

DATABASE_BASE_URL = 'https://geolite.maxmind.com/download/geoip/database'
DATABASE_URL = f'{DATABASE_BASE_URL}/GeoLite2-City.tar.gz'

MIS_OUTPUT_INPUT_DIR = os.path.join(BASE_PATH, '../outputs/mis')
TRAFFIC_LOGS_INPUT_DIR = os.path.join(BASE_PATH, '../inputs/traffic_logs')
TRAFFIC_LOGS_OUTPUT_DIR = os.path.join(BASE_PATH, '../outputs/traffic_logs')
TENANT_PROFILE_OUTPUT_DIR = os.path.join(
    BASE_PATH, "../outputs/tenant_profile")
TENANT_MODEL_OUTPUT_DIR = os.path.join(BASE_PATH, "../outputs/tenant_model")
ANOMALY_LOGS_OUTPUT_DIR = os.path.join(BASE_PATH, "../outputs/anomaly_logs")

LOG_PATH = os.path.join(BASE_PATH, 'logs')

GRANULARIZED_LOG_PATH = os.path.join(BASE_PATH, '../outputs/granularized_logs')

IP_DB_FILENAME = 'GeoLite2-City.mmdb'

BLACKLISTED_IP_URL = 'https://blocklist.greensnow.co/greensnow.txt'
BLACKLISTED_IP_FILENAME = 'greensnow.txt'

DUMPS_PATH = os.path.join(BASE_PATH, '../dumps')

# SPARK CONFIG
SPARK = SparkSession.builder.master(
    SPARK_MASTER_URL
).appName(
    SPARK_APP_NAME
).config(
    'spark.cassandra.connection.host',
    ','.join(CLUSTER_SEEDS)
).getOrCreate()

# INIT DIRECTORIES
create_directory(DUMPS_PATH)
create_directory(TRAFFIC_LOGS_INPUT_DIR)
create_directory(TRAFFIC_LOGS_OUTPUT_DIR)
create_directory(TENANT_PROFILE_OUTPUT_DIR)
create_directory(TENANT_MODEL_OUTPUT_DIR)
create_directory(ANOMALY_LOGS_OUTPUT_DIR)
create_directory(LOG_PATH)
create_directory(GRANULARIZED_LOG_PATH)
