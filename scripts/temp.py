import os
from foxhound.log_engine.DailyTrafficLogEngine import DailyTrafficLogEngine
from foxhound.mis_engine.DailyTrafficMISEngine import DailyTrafficMISEngine
from foxhound.mis_engine.DailyThreatMISEngine import DailyThreatMISEngine
from foxhound.rule_engine.DailyTrafficRuleEngine import DailyTrafficRuleEngine
from foxhound.log_engine.DailyThreatLogEngine import DailyThreatLogEngine
from foxhound.chart_engine.DailyChartEngine import DailyChartEngine
from foxhound.tt_engine.DailyTTEngine import DailyTTEngine
from foxhound.logger.Logger import Logger
import config
import utils
import pandas as pd
import datetime
import psycopg2
from sqlalchemy.orm import sessionmaker
from config import (
    TRAFFIC_LOGS_INPUT_DIR,
    THREAT_LOGS_INPUT_DIR,
    ANOMALY_LOGS_OUTPUT_DIR
)


logger = Logger(filename='logs/main.log')
logger.info(f'Script started on {datetime.datetime.now()}')


def traffic_log_engine(input_traffic_log):
    log = DailyTrafficLogEngine(
        input_traffic_log,
        config.TRAFFIC_LOGS_OUTPUT_DIR,
        config.COUNTRY_DB_FILEPATH,
        utils.get_db_engine(), config.SPARK)
    log.run()


for input_traffic_log in os.listdir(TRAFFIC_LOGS_INPUT_DIR):
    input_traffic_log = os.path.join(TRAFFIC_LOGS_INPUT_DIR, input_traffic_log)
    traffic_log_engine(input_traffic_log)



# INSERT INTO core_blacklistedip(ip_address) values('172.16.5.10');
# INSERT INTO core_blacklistedip(ip_address) values('54.36.148.130');
# INSERT INTO core_blacklistedip(ip_address) values('69.191.211.201');
# INSERT INTO core_blacklistedip(ip_address) values('15.177.38.2');
# INSERT INTO core_blacklistedip(ip_address) values('172.16.5.12');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.100.58');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.100.58');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.100.38');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.100.38');
# INSERT INTO core_blacklistedip(ip_address) values('10.0.77.10');
# INSERT INTO core_blacklistedip(ip_address) values('10.0.77.10');
# INSERT INTO core_blacklistedip(ip_address) values('98.207.104.128');
# INSERT INTO core_blacklistedip(ip_address) values('172.16.5.13');
# INSERT INTO core_blacklistedip(ip_address) values('172.16.5.13');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.100.58');
# INSERT INTO core_blacklistedip(ip_address) values('172.16.5.10');
# INSERT INTO core_blacklistedip(ip_address) values('114.119.164.218');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.100.58');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.100.58');
# INSERT INTO core_blacklistedip(ip_address) values('10.100.20.169');
# INSERT INTO core_blacklistedip(ip_address) values('10.100.20.169');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.20.84');
# INSERT INTO core_blacklistedip(ip_address) values('192.168.20.84');

# INSERT INTO core_blacklistedip(ip_address) VALUES('3.112.160.225');
# INSERT INTO core_blacklistedip(ip_address) VALUES('172.16.5.12');
# INSERT INTO core_blacklistedip(ip_address) VALUES('15.177.54.1');
# INSERT INTO core_blacklistedip(ip_address) VALUES('192.168.100.58');
# INSERT INTO core_blacklistedip(ip_address) VALUES('74.96.87.93');
# INSERT INTO core_blacklistedip(ip_address) VALUES('66.249.66.29');
# INSERT INTO core_blacklistedip(ip_address) VALUES('10.0.77.10');
# INSERT INTO core_blacklistedip(ip_address) VALUES('46.229.168.154');
# INSERT INTO core_blacklistedip(ip_address) VALUES('192.168.100.16');
# INSERT INTO core_blacklistedip(ip_address) VALUES('192.168.100.173');
# INSERT INTO core_blacklistedip(ip_address) VALUES('172.16.5.12');
# INSERT INTO core_blacklistedip(ip_address) VALUES('172.16.5.10');
# INSERT INTO core_blacklistedip(ip_address) VALUES('27.97.84.224');
# INSERT INTO core_blacklistedip(ip_address) VALUES('27.34.48.156');
# INSERT INTO core_blacklistedip(ip_address) VALUES('10.9.9.25');
# INSERT INTO core_blacklistedip(ip_address) VALUES('192.168.0.22');
# INSERT INTO core_blacklistedip(ip_address) VALUES('172.16.5.12');
# INSERT INTO core_blacklistedip(ip_address) VALUES('172.16.5.10');
