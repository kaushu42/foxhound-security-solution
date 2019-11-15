import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

DATABASE_URL = 'https://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz'

FH_DB_NAME = "FH_DB_NAME"
FH_DB_USER = "FH_DB_USER"
FH_DB_PASSWORD = "FH_DB_PASSWORD"

HOST = "localhost"
PORT = 5432

TRAFFIC_LOGS_INPUT_DIR = os.path.join(BASE_PATH, '../inputs/traffic_logs')
TRAFFIC_LOGS_OUTPUT_DIR = os.path.join(BASE_PATH, '../outputs/traffic_logs')
IP_PROFILE_OUTPUT_DIR = os.path.join(BASE_PATH, "../outputs/ip_profile")
IP_MODEL_OUTPUT_DIR = os.path.join(BASE_PATH, "../outputs/ip_model")
ANOMALY_LOGS_OUTPUT_DIR = os.path.join(BASE_PATH, "../outputs/anomaly_logs")

LOG_FILE = os.path.join(BASE_PATH, 'main.log')
