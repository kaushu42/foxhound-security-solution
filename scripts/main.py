import time
import os

from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

import foxhound as fh
from foxhound.db_engine.core_models import VirtualSystem
from foxhound.ml_engine.Initialize import Initialize
from foxhound.ml_engine.MLEngine import MLEngine

import config

db_name = os.environ.get(config.FH_DB_NAME, '')
db_user = os.environ.get(config.FH_DB_USER, '')
db_password = os.environ.get(config.FH_DB_PASSWORD, '')
db_engine = create_engine(
    f'postgresql://{db_user}:{db_password}@{config.HOST}:{config.PORT}/{db_name}'
)
Session = sessionmaker(bind=db_engine)
session = Session()

# Seed the database
if session.query(VirtualSystem).count() == 0:
    vsys1 = VirtualSystem(
        code='vsys1',
        name='Virtual System 1',
        domain_code='localhost1',
        tenant_name='tenant1',
        domain_url='localhost1'
    )
    vsys2 = VirtualSystem(
        code='vsys2',
        name='Virtual System 2',
        domain_code='localhost2',
        tenant_name='tenant2',
        domain_url='localhost2'
    )
    vsys3 = VirtualSystem(
        code='vsys3',
        name='Virtual System 3',
        domain_code='localhost3',
        tenant_name='tenant3',
        domain_url='localhost3'
    )
    session.add(vsys1)
    session.add(vsys2)
    session.add(vsys3)
    session.commit()
    session.close()


pa = fh.dc_engine.PaloAltoEngine(
    config.TRAFFIC_LOGS_INPUT_DIR, config.TRAFFIC_LOGS_OUTPUT_DIR)
pa.run(verbose=True)

db = fh.db_engine.DBEngine(config.TRAFFIC_LOGS_OUTPUT_DIR, db_engine=db_engine)
db.run(verbose=True)


init = Initialize(config.TRAFFIC_LOGS_INPUT_DIR, config.IP_PROFILE_OUTPUT_DIR)
init.parse_all_csv()

mle = MLEngine(config.IP_PROFILE_OUTPUT_DIR, config.IP_MODEL_OUTPUT_DIR,
               config.TRAFFIC_LOGS_INPUT_DIR, config.ANOMALY_LOGS_OUTPUT_DIR)
mle.run(create_model=True, predict=True)
