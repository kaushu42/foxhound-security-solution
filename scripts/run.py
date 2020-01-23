import os
import foxhound as fh
from foxhound.ml_engine.Initialize import Initialize
from foxhound.ml_engine.MLEngine import MLEngine
from foxhound.tt_engine.TTAnomaly import TTAnomaly
from foxhound.mis_engine.MISEngine import MISEngine
from foxhound.chart_engine.ChartEngine import ChartEngine
from foxhound.rule_engine.RuleEngine import RuleEngine
import config
import utils


def ml_engine(init=True, mle=True, create_model=True, predict=True):
    if init:
        init = Initialize(config.TRAFFIC_LOGS_OUTPUT_DIR,
                          config.TENANT_PROFILE_OUTPUT_DIR)
        init.parse_all_csv('tenant')
    if mle:
        mle = MLEngine(config.TENANT_PROFILE_OUTPUT_DIR,
                       config.TENANT_MODEL_OUTPUT_DIR,
                       config.TRAFFIC_LOGS_OUTPUT_DIR,
                       config.ANOMALY_LOGS_OUTPUT_DIR,
                       verbose=True)
        mle.run(create_model=create_model, predict=predict)


def dc_engine(verbose=True):
    pa = fh.dc_engine.PaloAltoEngine(
        config.TRAFFIC_LOGS_INPUT_DIR,
        config.TRAFFIC_LOGS_OUTPUT_DIR,
        config.GRANULARIZED_LOG_PATH,
        spark_session=config.SPARK
    )
    pa.run(verbose=verbose)


def db_engine(db_engine, logging, verbose=True):
    db = fh.db_engine.DBEngine(
        config.TRAFFIC_LOGS_OUTPUT_DIR,
        config.GRANULARIZED_LOG_PATH,
        db_engine=db_engine,
        db_path=os.path.join(config.BASE_PATH, config.IP_DB_FILENAME),
        logging=logging
    )
    db.run(verbose=verbose)
    db.clean()


def tt_engine(delete_logs=False):
    tt_anomaly = TTAnomaly(config.ANOMALY_LOGS_OUTPUT_DIR, db_engine)
    tt_anomaly.run()
    if delete_logs:
        anomaly_logs = [os.path.join(config.ANOMALY_LOGS_OUTPUT_DIR, f)
                        for f in os.listdir(config.ANOMALY_LOGS_OUTPUT_DIR)]
        for log in anomaly_logs:
            os.remove(log)
            logging.info(f'{log} deleted!')


def mis_engine():
    mis = MISEngine(config.SPARK, utils.get_db_engine(
    ), config.TRAFFIC_LOGS_INPUT_DIR, config.MIS_OUTPUT_INPUT_DIR)
    mis.run()


def chart_engine():
    chart = ChartEngine(
        config.GRANULARIZED_LOG_PATH,
        spark=config.SPARK,
        db_engine=utils.get_db_engine()
    )
    chart.run()


def rule_engine():
    rule = RuleEngine(
        config.GRANULARIZED_LOG_PATH,
        spark=config.SPARK
    )
    rule.run()
