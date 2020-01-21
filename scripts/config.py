from pyspark.sql import SparkSession
import os
import findspark

findspark.init()


def create_directory(path):
    if not os.path.exists(path):
        os.mkdir(path)


os.environ['PYSPARK_SUBMIT_ARGS'] = '--packages org.postgresql:postgresql:42.1.1 pyspark-shell'

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

DATABASE_URL = 'https://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz'

FH_DB_NAME = "FH_DB_NAME"
FH_DB_USER = "FH_DB_USER"
FH_DB_PASSWORD = "FH_DB_PASSWORD"

HOST = "localhost"
PORT = 5432

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
SPARK_MASTER_URL = "spark://127.0.0.1:7077"
SPARK_MASTER_LOCAL_URL = "master[*]"
CLUSTER_SEEDS = ['172.16.3.36', '172.16.3.37', '127.0.0.1'][-1]
SPARK_APP_NAME = 'foxhound'
#SPARK = SparkSession.builder.getOrCreate()

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
