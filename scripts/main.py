import time
import os
import datetime
import re
import logging

from tqdm import tqdm

import pandas as pd

import config
import seedutils
import utils
import run
from batch_logger import create_batch_log, update_batch_state
import batch_logger

# LOG_FILE = os.path.join(config.LOG_PATH, f'{os.path.basename(__file__)}.log')
# logging.basicConfig(
#     filename=LOG_FILE,
#     level=logging.DEBUG
# )
# logging.info(f'Script ran on {datetime.datetime.now()}')
try:
    batch = create_batch_log("BEFORE CSV SEED RUNNING", "SEED", "DAILY SEED",
                             "SEEDING STARTED", "RUNNING", "RUNNING")
    #seedutils.seed()
    batch = update_batch_state(batch, "SEED COMPLETE", "STOPPED", "SUCCESS")
    batch = create_batch_log("BEFORE CSV LOG ENGINE", "LOG ENGINE",
                             "LOG ENGINE", "LOG EXTRACTION STARTED", "RUNNING", "RUNNING")
    try:
        run.log_engine()
        batch = update_batch_state(
            batch, "LOG WRITING COMPLETE", "STOPPED", "SUCCESS")
    except Exception as e:
        batch = update_batch_state(
            batch, e, "EXIT", "FAILURE")

    batch = create_batch_log("BEFORE CSV MIS ENGINE", "MIS ENGINE",
                             "MIS ENGINE", "MIS EXTRACTION STARTED", "RUNNING", "RUNNING")
    try:
        run.mis_engine()
        batch = update_batch_state(
            batch, "MIS EXTRACTION COMPLETE", "STOPPED", "SUCCESS")
    except Exception as e:
        batch = update_batch_state(
            batch, e, "EXIT", "FAILURE")

    # run.ml_engine()
    batch = create_batch_log("BEFORE CSV DC ENGINE", "DC ENGINE",
                             "DC ENGINE", "DC ENGINE STARTED", "RUNNING", "RUNNING")
    try:
        # run.dc_engine()
        batch = update_batch_state(
            batch, "DC ENGINE COMPLETE", "STOPPED", "SUCCESS")
    except Exception as e:
        batch = update_batch_state(
            batch, e, "EXIT", "FAILURE")

    batch = create_batch_log("BEFORE CSV RULE ENGINE", "RULE ENGINE",
                             "RULE ENGINE", "RULE ENGINE STARTED", "RUNNING", "RUNNING")
    try:
        # run.rule_engine()
        batch = update_batch_state(
            batch, "RULE ENGINE COMPLETE", "STOPPED", "SUCCESS")
    except Exception as e:
        batch = update_batch_state(
            batch, e, "EXIT", "FAILURE")

    batch = create_batch_log("BEFORE CSV CHART ENGINE", "CHART ENGINE",
                             "CHART ENGINE", "RULE ENGINE STARTED", "RUNNING", "RUNNING")
    try:
        # run.chart_engine()
        batch = update_batch_state(
            batch, "CHART ENGINE COMPLETE", "STOPPED", "SUCCESS")
    except Exception as e:
        batch = update_batch_state(
            batch, e, "EXIT", "FAILURE")

    #run.db_engine()
    # run.tt_engine()

except Exception as e:
    logging.exception(f'Terminated on {datetime.datetime.now()}')
    raise(e)
