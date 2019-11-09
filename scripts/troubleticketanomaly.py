import time
import os

from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

import pandas as pd

import foxhound as fh
from foxhound.db_engine.core_models import (
    VirtualSystem, TrafficLogDetail
)
from foxhound.db_engine.troubleticket_models import (
    TroubleTicketAnomaly, TroubleTicketFollowUpAnomaly
)
from foxhound.ml_engine.Initialize import Initialize
from foxhound.ml_engine.MLEngine import MLEngine

import config

if not os.path.exists(config.ANOMALY_LOGS_OUTPUT_DIR):
    raise Exception('Generate anomaly logs first')

for f in os.listdir(config.ANOMALY_LOGS_OUTPUT_DIR):
    if not f.endswith('csv'):
        continue
    data = pd.read_csv(
        os.path.join(config.ANOMALY_LOGS_OUTPUT_DIR, f)
    )
    print(data)
