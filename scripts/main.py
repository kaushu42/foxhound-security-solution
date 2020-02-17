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
    seedutils.seed()
    run.log_engine()
    run.mis_engine()
    # run.ml_engine()
    run.dc_engine()
    run.rule_engine()
    run.chart_engine()
    run.db_engine()
    # run.tt_engine()
    run.threat_engine()

except Exception as e:
    logging.exception(f'Terminated on {datetime.datetime.now()}')
    raise(e)
