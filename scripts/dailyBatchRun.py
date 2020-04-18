import os
from config import TRAFFIC_LOGS_INPUT_DIR,THREAT_LOGS_INPUT_DIR
import dailyBatch as daily_batch_run

# for input_traffic_log in os.listdir(TRAFFIC_LOGS_INPUT_DIR):
#    if ((not daily_batch_run.is_traffic_log_already_processed(input_traffic_log)) and input_traffic_log.endswith(".csv")):
#       # sending complete log path to engine 
#       input_traffic_log = os.path.join(TRAFFIC_LOGS_INPUT_DIR,input_traffic_log)
#       daily_batch_run.ready_for_staging()
#       daily_batch_run.traffic_mis_engine(input_traffic_log)
#       daily_batch_run.traffic_log_engine(input_traffic_log)
#       daily_batch_run.traffic_rule_engine(input_traffic_log)
#       daily_batch_run.commit_changes_to_production()


for input_threat_log in os.listdir(THREAT_LOGS_INPUT_DIR):
   if ((not daily_batch_run.is_threat_log_already_processed(input_threat_log)) and input_threat_log.endswith(".csv")):
      # sending complete log path to engine 
      input_threat_log = os.path.join(THREAT_LOGS_INPUT_DIR,input_threat_log)
      daily_batch_run.threat_log_engine(input_threat_log)
