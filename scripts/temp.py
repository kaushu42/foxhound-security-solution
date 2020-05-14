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
