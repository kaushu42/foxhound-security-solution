from foxhound.ml_engine.Initialize import Initialize
from foxhound.ml_engine.MLEngine import MLEngine
from config import (
    TRAFFIC_LOGS_INPUT_DIR, TENANT_PROFILE_OUTPUT_DIR,
    TENANT_MODEL_OUTPUT_DIR, ANOMALY_LOGS_OUTPUT_DIR,
    SPARK
)



def ml_engine(init=False, mle=True, create_model=False, predict=False,
            predict_on_anomaly_csv=False, input_traffic_log=None):
    if init:
        init = Initialize(TRAFFIC_LOGS_INPUT_DIR,
                          TENANT_PROFILE_OUTPUT_DIR, SPARK)
        init.parse_all_csv()
        # init.create_ip_profile_from_db()
    if mle:
        mle = MLEngine(TENANT_PROFILE_OUTPUT_DIR,
                       TENANT_MODEL_OUTPUT_DIR,
                       TENANT_MODEL_OUTPUT_DIR,
                       ANOMALY_LOGS_OUTPUT_DIR,
                       SPARK,
                       verbose=True)

        mle.run(
            create_model=create_model, predict=predict,
            predict_on_anomaly_csv=predict_on_anomaly_csv, input_traffic_log=input_traffic_log)

ml_engine(init=True , mle=True, create_model=True)