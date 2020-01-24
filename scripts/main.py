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

LOG_FILE = os.path.join(config.LOG_PATH, f'{os.path.basename(__file__)}.log')
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.DEBUG
)
logging.info(f'Script ran on {datetime.datetime.now()}')
try:
    batch = create_batch_log("BEFORE CSV SEED RUNNING", "SEED", "DAILY SEED",
                             "SEEDING STARTED", "RUNNING", "RUNNING")
    seedutils.seed()
    batch = update_batch_state(batch, "SEED COMPLETE", "STOPPED", "SUCCESS")
    batch = create_batch_log("BEFORE CSV MIS ENGINE", "MIS ENGINE",
                             "MIS ENGINE", "MIS EXTRACTION STARTED", "RUNNING", "RUNNING")
    try:
        run.mis_engine()
        batch = update_batch_state(
            batch, "MIS EXTRACTION COMPLETE", "STOPPED", "SUCCESS")
    except Exception as e:
        batch = update_batch_state(
            batch, e, "EXIT", "FAILURE")

    run.ml_engine()
    # run.dc_engine()
    # run.db_engine(utils.get_db_engine(), logging, verbose=False)
    # run.tt_engine()
    # run.chart_engine()

except Exception as e:
    logging.exception(f'Terminated on {datetime.datetime.now()}')
    raise(e)
