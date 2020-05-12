import os
from foxhound.log_engine.DailyTrafficLogEngine import DailyTrafficLogEngine
from foxhound.mis_engine.DailyTrafficMISEngine import DailyTrafficMISEngine
from foxhound.mis_engine.DailyThreatMISEngine import DailyThreatMISEngine
from foxhound.rule_engine.DailyTrafficRuleEngine import DailyTrafficRuleEngine
from foxhound.log_engine.DailyThreatLogEngine import DailyThreatLogEngine
from foxhound.chart_engine.DailyChartEngine import DailyChartEngine
from foxhound.logger.Logger import Logger
import config
import utils
import pandas as pd
import datetime
import psycopg2
from sqlalchemy.orm import sessionmaker

logger = Logger(filename='logs/main.log')
logger.info(f'Script started on {datetime.datetime.now()}')

def check_create_bookmark(input_log):
    engine = utils.get_db_engine()
    Session = sessionmaker(bind=engine, autocommit=True)
    session = Session()
    session.begin()
    rs = session.execute(f"SELECT log_name from fh_bookmark where log_name = '{input_log}'")
    if (rs.fetchone() is None):
        rs = session.execute(f"INSERT INTO fh_bookmark (datetime, log_name, bookmark) VALUES ('{datetime.datetime.now()}','{input_log}','none')")
        session.commit()
        session.close()
        return "none"
    else :
        rs = session.execute(f"SELECT bookmark from fh_bookmark where log_name = '{input_log}'")
        return(rs.fetchone()[0])
    session.commit()
    session.close()

def set_bookmark(input_log,bookmark):
    engine = utils.get_db_engine()
    Session = sessionmaker(bind=engine, autocommit=True)
    session = Session()
    session.begin()
    rs = session.execute(f"UPDATE fh_bookmark set bookmark = '{bookmark}' where log_name='{input_log}'")
    session.commit()
    session.close()



def is_traffic_log_already_processed(input_traffic_log):
    processed_logs_from_db = pd.read_sql_table(
        'fh_prd_trfc_log_f', utils.get_db_engine()).set_index("log_name").to_dict()["id"]
    if input_traffic_log in processed_logs_from_db:
        return True
    return False


def is_threat_log_already_processed(input_threat_log):
    processed_logs_from_db = pd.read_sql_table(
        'fh_prd_thrt_log_f', utils.get_db_engine()).set_index("log_name").to_dict()["id"]
    if input_threat_log in processed_logs_from_db:
        return True
    return False


def traffic_mis_engine(input_traffic_log):
    if check_create_bookmark(input_traffic_log) == "none":
        mis = DailyTrafficMISEngine(config.SPARK, utils.get_db_engine(
        ), input_traffic_log, config.MIS_OUTPUT_INPUT_DIR)
        mis.run()
        set_bookmark(input_traffic_log,"log")


def threat_mis_engine(input_threat_log):
    if(check_create_bookmark(input_threat_log)=="none"):
        mis = DailyThreatMISEngine(config.SPARK, utils.get_db_engine(
        ), input_threat_log, config.MIS_OUTPUT_INPUT_DIR)
        mis.run()
        set_bookmark(input_threat_log,"log")


def traffic_log_engine(input_traffic_log):
    if check_create_bookmark(input_traffic_log) == "log":
        log = DailyTrafficLogEngine(
            input_traffic_log,
            config.TRAFFIC_LOGS_OUTPUT_DIR,
            config.COUNTRY_DB_FILEPATH,
            utils.get_db_engine(), config.SPARK)
        log.run()
        set_bookmark(input_traffic_log,"rule")


def traffic_rule_engine(input_traffic_log):
    if check_create_bookmark(input_traffic_log) == "rule":
        rule = DailyTrafficRuleEngine(
            input_traffic_log, utils.get_db_engine(), config.SPARK)
        rule.run()
        set_bookmark(input_traffic_log,"chart")


def threat_log_engine(input_threat_log):
    if check_create_bookmark(input_threat_log) == "log":
        log = DailyThreatLogEngine(
            input_threat_log,
            config.TRAFFIC_LOGS_OUTPUT_DIR,
            config.COUNTRY_DB_FILEPATH,
            utils.get_db_engine(), config.SPARK)
        log.run()
        set_bookmark(input_threat_log,"complete")


def traffic_chart_engine(input_traffic_log):
    if check_create_bookmark(input_traffic_log) == "chart":
        chart = DailyChartEngine(
            input_traffic_log,
            spark=config.SPARK,
            db_engine=utils.get_db_engine()
        )
        chart.run()
        set_bookmark(input_traffic_log,"complete")


def ready_for_staging():
    # Create SAVE POINT  For DB
    # Truncate Hourly and Daily Staging Table for Staging
    pass


def insert_stage_data_to_prod_table(con, stage_table, prod_table):
    # get all columns from stage_table and save it as array
    rs = con.execute(
        f"select count(*) mismatch,1,1 from (select column_name from information_schema.columns where table_name = '{stage_table}' except select column_name from information_schema.columns where table_name = '{prod_table}')a"
    )
    mismatch_count = rs.fetchone()[0]
    if(mismatch_count != 0):
        print("Stage table and prod table do not match")
        return
    rs = con.execute(
        f"SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name ='{stage_table}'"
    )
    stage_columns = []
    for row in rs:
        if (row[0] != 'id'):
            stage_columns.append(row[0])
    col_in_string = ','.join(map(str, stage_columns))
    insert_sql = f"INSERT INTO {prod_table}({col_in_string}) SELECT {col_in_string} FROM {stage_table}"
    print('******')
    print(insert_sql)
    print('******')
    rs = con.execute(insert_sql)
    print(f"stage data from {stage_table} loaded to {prod_table} sucessfully")


def commit_changes_to_production():
    engine = utils.get_db_engine()
    Session = sessionmaker(bind=engine, autocommit=True)
    session = Session()
    session.begin()
    try:
        ## traffic log mis
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_mis_dy_a','fh_prd_trfc_mis_dy_a')
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_mis_new_app_dy_a','fh_prd_trfc_mis_new_app_dy_a')
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_mis_new_dst_ip_dy_a','fh_prd_trfc_mis_new_dst_ip_dy_a')
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_mis_new_src_ip_dy_a','fh_prd_trfc_mis_new_src_ip_dy_a')
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_mis_req_frm_blip_dy_a','fh_prd_trfc_mis_req_frm_blip_dy_a')
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_mis_res_to_blip_dy_a','fh_prd_trfc_mis_res_to_blip_dy_a')

        ## traffic log log
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_log_dtl_f','fh_prd_trfc_log_dtl_f')
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_log_dtl_hr_a','fh_prd_trfc_log_dtl_hr_a')
        insert_stage_data_to_prod_table(session,'fh_stg_trfc_log_dtl_dy_a','fh_prd_trfc_log_dtl_dy_a')

        ## TODO: Create production table for these
        ## traffic log rule

        ## traffic log chart
        

        ## traffic log trouble ticket
        

        ## threat log log
        insert_stage_data_to_prod_table(session,'fh_stg_thrt_log_dtl_f','fh_prd_thrt_log_dtl_f')
        insert_stage_data_to_prod_table(session,'fh_stg_thrt_log_dtl_evnt_f','fh_prd_thrt_log_dtl_evnt_f')
    except:
        session.rollback()
        raise
    finally:
        session.commit()
        session.close()

