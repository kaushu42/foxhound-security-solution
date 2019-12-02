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

LOG_FILE = os.path.join(config.LOG_PATH, f'{os.path.basename(__file__)}.log')
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.DEBUG
)
logging.info(f'Script ran on {datetime.datetime.now()}')
try:
    seedutils.seed()

    run.ml_engine()
    run.dc_engine()
    run.db_engine(utils.get_db_engine(), logging)
    run.tt_engine()

except Exception as e:
    logging.exception(f'Terminated on {datetime.datetime.now()}')
    raise(e)
