import time
import os
import datetime
import re
import logging

from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

from tqdm import tqdm

import pandas as pd

import foxhound as fh
from foxhound.db_engine.core_models import (
    VirtualSystem, TrafficLogDetail, Country,
    TrafficLog
)

from foxhound.ml_engine.Initialize import Initialize
from foxhound.ml_engine.MLEngine import MLEngine
from foxhound.tt_engine.TTAnomaly import TTAnomaly

import config
import seedutils

logging.basicConfig(
    filename=config.LOG_FILE,
    level=logging.DEBUG
)
logging.info(f'Script ran on {datetime.datetime.now()}')
try:
    if not os.path.exists(
        os.path.join(config.BASE_PATH, 'GeoLite2-City.mmdb')
    ):
        import wget
        import tarfile
        import shutil

        print('Downloading IP database....')

        wget.download(config.DATABASE_URL)
        tar = tarfile.open(os.path.join(
            config.BASE_PATH, 'GeoLite2-City_20191029.tar.gz'))
        tar.extractall()
        os.rename(
            os.path.join(
                config.BASE_PATH,
                'GeoLite2-City_20191029/GeoLite2-City.mmdb'
            ),
            os.path.join(
                config.BASE_PATH, './GeoLite2-City.mmdb'
            )
        )
        shutil.rmtree('GeoLite2-City_20191029/')
        os.remove('GeoLite2-City_20191029.tar.gz')

        print('\nDone')

    db_name = os.environ.get(config.FH_DB_NAME, '')
    db_user = os.environ.get(config.FH_DB_USER, '')
    db_password = os.environ.get(config.FH_DB_PASSWORD, '')
    db_engine = create_engine(
        f'postgresql://{db_user}:{db_password}@{config.HOST}:{config.PORT}/{db_name}'
    )
    Session = sessionmaker(bind=db_engine)
    session = Session()

    seedutils.seed(session)
    init = Initialize(config.TRAFFIC_LOGS_INPUT_DIR,
                      config.IP_PROFILE_OUTPUT_DIR)
    init.parse_all_csv()

    mle = MLEngine(config.IP_PROFILE_OUTPUT_DIR, config.IP_MODEL_OUTPUT_DIR,
                   config.TRAFFIC_LOGS_INPUT_DIR, config.ANOMALY_LOGS_OUTPUT_DIR)
    mle.run(create_model=True, predict=True)

    pa = fh.dc_engine.PaloAltoEngine(
        config.TRAFFIC_LOGS_INPUT_DIR, config.TRAFFIC_LOGS_OUTPUT_DIR)
    pa.run(verbose=True)

    db = fh.db_engine.DBEngine(
        config.TRAFFIC_LOGS_OUTPUT_DIR,
        db_engine=db_engine,
        db_path=os.path.join(config.BASE_PATH, 'GeoLite2-City.mmdb')
    )
    db.run(verbose=True)

    tt_anomaly = TTAnomaly(config.ANOMALY_LOGS_OUTPUT_DIR, db_engine)
    tt_anomaly.run()

    anomaly_logs = [os.path.join(config.ANOMALY_LOGS_OUTPUT_DIR, f)
                    for f in os.listdir(config.ANOMALY_LOGS_OUTPUT_DIR)]
    for log in anomaly_logs:
        os.remove(log)
        print(f'{log} deleted!')
except Exception:
    logging.exception(f'An error occured on {datetime.datetime.now()}')
