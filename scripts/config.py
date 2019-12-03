import os


def create_directory(path):
    if not os.path.exists(path):
        os.mkdir(path)


BASE_PATH = os.path.dirname(os.path.abspath(__file__))

DATABASE_URL = 'https://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz'

FH_DB_NAME = "FH_DB_NAME"
FH_DB_USER = "FH_DB_USER"
FH_DB_PASSWORD = "FH_DB_PASSWORD"

HOST = "localhost"
PORT = 5432

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

create_directory(DUMPS_PATH)
create_directory(TRAFFIC_LOGS_INPUT_DIR)
create_directory(TRAFFIC_LOGS_OUTPUT_DIR)
create_directory(TENANT_PROFILE_OUTPUT_DIR)
create_directory(TENANT_MODEL_OUTPUT_DIR)
create_directory(ANOMALY_LOGS_OUTPUT_DIR)
create_directory(LOG_PATH)
create_directory(GRANULARIZED_LOG_PATH)
