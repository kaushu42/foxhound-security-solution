import os
from config import (
    TRAFFIC_LOGS_INPUT_DIR,
    THREAT_LOGS_INPUT_DIR,
    ANOMALY_LOGS_OUTPUT_DIR
)
import dailyBatch as daily_batch_run
import seedutils

# Ready for staging
seedutils.seed()

# for input_traffic_log in os.listdir(TRAFFIC_LOGS_INPUT_DIR):
#     input_traffic_log = os.path.join(TRAFFIC_LOGS_INPUT_DIR, input_traffic_log)
#     bk = daily_batch_run.check_create_bookmark(input_traffic_log)
#     if(bk != "complete"):
#         daily_batch_run.ready_for_staging()
#         daily_batch_run.traffic_mis_engine(input_traffic_log)
#         daily_batch_run.traffic_log_engine(input_traffic_log)
#         daily_batch_run.traffic_rule_engine(input_traffic_log)
#         daily_batch_run.traffic_chart_engine(input_traffic_log)
#         daily_batch_run.commit_changes_to_production()


for input_threat_log in os.listdir(THREAT_LOGS_INPUT_DIR):
    input_threat_log = os.path.join(THREAT_LOGS_INPUT_DIR, input_threat_log)
    bk = daily_batch_run.check_create_bookmark(input_threat_log)
    if(bk != "complete"):
        daily_batch_run.ready_for_staging()
        daily_batch_run.threat_mis_engine(input_threat_log)
        daily_batch_run.threat_log_engine(input_threat_log)
        daily_batch_run.commit_changes_to_production()


# for input_anomaly_log in os.listdir(ANOMALY_LOGS_OUTPUT_DIR):
#     input_anomaly_log = os.path.join(
#         ANOMALY_LOGS_OUTPUT_DIR, input_anomaly_log)
#     # bk = daily_batch_run.check_create_bookmark(input_anomaly_log)
#     # if(bk != "complete"):
#     daily_batch_run.ready_for_staging()
#     daily_batch_run.traffic_tt_engine(input_anomaly_log)
#     daily_batch_run.commit_changes_to_production()

