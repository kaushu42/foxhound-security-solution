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
import dailyBatch as daily_batch_run
import config

for input_traffic_log in os.listdir(config.TRAFFIC_LOGS_INPUT_DIR):
   if (input_traffic_log.endswith(".csv") and (not daily_batch_run.is_traffic_log_already_processed(input_traffic_log))):
      daily_batch_run.mis_engine(input_traffic_log)
      daily_batch_run.log_engine(input_traffic_log)
