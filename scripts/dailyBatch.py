import os
import foxhound as fh
from foxhound.log_engine.DailyTrafficLogEngine import DailyTrafficLogEngine
from foxhound.mis_engine.DailyTrafficMISEngine import DailyTrafficMISEngine
import config
import utils
import pandas as pd

def is_traffic_log_already_processed(input_traffic_log):
   processed_logs_from_db = pd.read_sql_table('fh_prd_trfc_log_f', utils.get_db_engine()).set_index("log_name").to_dict()["id"]
   if input_traffic_log in processed_logs_from_db:
      return True
   return False

def mis_engine(input_traffic_log):
   mis = DailyTrafficMISEngine(config.SPARK,utils.get_db_engine(),input_traffic_log,config.MIS_OUTPUT_INPUT_DIR)
   mis.run()


def log_engine(input_traffic_log):
   log = DailyTrafficLogEngine(
      input_traffic_log,
      config.TRAFFIC_LOGS_OUTPUT_DIR,
      config.COUNTRY_DB_FILEPATH,
      utils.get_db_engine(),config.SPARK)
   log.run()

