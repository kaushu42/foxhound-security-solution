import time
import os
import datetime
import re

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

if not os.path.exists('./GeoLite2-City.mmdb'):
    import wget
    import tarfile
    import shutil

    print('Downloading IP database....')

    wget.download(config.DATABASE_URL)
    tar = tarfile.open('GeoLite2-City_20191029.tar.gz')
    tar.extractall()
    os.rename(
        'GeoLite2-City_20191029/GeoLite2-City.mmdb',
        './GeoLite2-City.mmdb'
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

# pa = fh.dc_engine.PaloAltoEngine(
#     config.TRAFFIC_LOGS_INPUT_DIR, config.TRAFFIC_LOGS_OUTPUT_DIR)
# pa.run(verbose=True)
start = time.time()
db = fh.db_engine.DBEngine(config.TRAFFIC_LOGS_OUTPUT_DIR, db_engine=db_engine)
db.run(verbose=True)
print(time.time() - start)
# if session.query(Country).count() == 0:
#     ips = set()
#     data = session.query(TrafficLogDetail.source_ip).distinct()
#     [ips.add(i.source_ip) for i in data]
#     data = session.query(TrafficLogDetail.destination_ip).distinct()
#     [ips.add(i.destination_ip) for i in data]

#     for ip in ips:
#         if session.query(Country).filter_by(ip=ip).scalar():
#             continue
#         ip_country = Country(ip=ip)
#         country_name = ''
#         country_iso_code = ''
#         try:
#             if self._is_ip_private(ip) is not True:
#                 country = self._reader.city(ip).country
#                 country_iso_code = country.iso_code
#                 country_name = country.name
#                 if country_iso_code is None:
#                     country_name = 'Unknown'
#                     country_iso_code = '---'
#             else:
#                 country_iso_code = "np"
#                 country_name = "Nepal"
#         except geoip2.errors.AddressNotFoundError:
#             country_name = 'Unknown'
#             country_iso_code = '---'

#         ip_country.country_name = country_name
#         ip_country.country_iso_code = country_iso_code.lower()
#         session.add(ip_country)
#     session.flush()
#     session.commit()

# init = Initialize(config.TRAFFIC_LOGS_INPUT_DIR, config.IP_PROFILE_OUTPUT_DIR)
# init.parse_all_csv()

# mle = MLEngine(config.IP_PROFILE_OUTPUT_DIR, config.IP_MODEL_OUTPUT_DIR,
#                config.TRAFFIC_LOGS_INPUT_DIR, config.ANOMALY_LOGS_OUTPUT_DIR)
# mle.run(create_model=True, predict=True)

# tt_anomaly = TTAnomaly(config.ANOMALY_LOGS_OUTPUT_DIR, db_engine)
# tt_anomaly.run()
