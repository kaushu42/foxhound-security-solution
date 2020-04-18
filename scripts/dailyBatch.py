import os
import foxhound as fh
from foxhound.log_engine.DailyTrafficLogEngine import DailyTrafficLogEngine
from foxhound.mis_engine.DailyTrafficMISEngine import DailyTrafficMISEngine
from foxhound.rule_engine.DailyTrafficRuleEngine import DailyTrafficRuleEngine
from foxhound.log_engine.DailyThreatLogEngine  import DailyThreatLogEngine
import config
import utils
import pandas as pd
import datetime

def is_traffic_log_already_processed(input_traffic_log):
   processed_logs_from_db = pd.read_sql_table('fh_prd_trfc_log_f', utils.get_db_engine()).set_index("log_name").to_dict()["id"]
   if input_traffic_log in processed_logs_from_db:
      return True
   return False

def is_threat_log_already_processed(input_threat_log):
   processed_logs_from_db = pd.read_sql_table('fh_prd_thrt_log_f', utils.get_db_engine()).set_index("log_name").to_dict()["id"]
   if input_threat_log in processed_logs_from_db:
      return True
   return False


def traffic_mis_engine(input_traffic_log):
   mis = DailyTrafficMISEngine(config.SPARK,utils.get_db_engine(),input_traffic_log,config.MIS_OUTPUT_INPUT_DIR)
   mis.run()


def traffic_log_engine(input_traffic_log):
   log = DailyTrafficLogEngine(
      input_traffic_log,
      config.TRAFFIC_LOGS_OUTPUT_DIR,
      config.COUNTRY_DB_FILEPATH,
      utils.get_db_engine(),config.SPARK)
   log.run()

def traffic_rule_engine(input_traffic_log):
   rule = DailyTrafficRuleEngine(input_traffic_log,utils.get_db_engine(),config.SPARK)
   rule.run()


def threat_log_engine(input_threat_log):
   log = DailyThreatLogEngine(
      input_threat_log,
      config.TRAFFIC_LOGS_OUTPUT_DIR,
      config.COUNTRY_DB_FILEPATH,
      utils.get_db_engine(),config.SPARK)
   log.run()


def ready_for_staging():
   # Create SAVE POINT  For DB
   # Truncate Hourly and Daily Staging Table for Staging
   pass

def commit_changes_to_production():
   # commit changes to production using bulk insert or insert
   db_engine = utils.get_db_engine()
   with db_engine.connect() as con:
      con.execute(f"BEGIN TRANSACTION")
      # create insert dynamic insert statements for insertion without id
      # rs = con.execute(f"INSERT INTO fh_prd_thrt_log_dtl_evnt_f SELECT * FROM fh_stg_thrt_log_dtl_evnt_f")
      con.execute(f"COMMIT")

