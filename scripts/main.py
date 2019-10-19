import foxhound as fh
import time
import os
from sqlalchemy.engine import create_engine

pa = fh.dc_engine.PaloAltoEngine(
    '../inputs/traffic_logs', '../outputs/traffic_logs')
pa.run(verbose=True)

db_name = os.environ.get('FH_DB_NAME', '')
db_user = os.environ.get('FH_DB_USER', '')
db_password = os.environ.get('FH_DB_PASSWORD', '')
db_engine = create_engine(
    f'postgresql://{db_user}:{db_password}@localhost:5432/{db_name}'
)

db = fh.db_engine.DBEngine('../outputs/traffic_logs', db_engine=db_engine)
db.run(table_name='core_log', verbose=True)
