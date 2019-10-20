import foxhound as fh
import time
import os

from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

from foxhound.db_engine.core_models import VirtualSystem


db_name = os.environ.get('FH_DB_NAME', '')
db_user = os.environ.get('FH_DB_USER', '')
db_password = os.environ.get('FH_DB_PASSWORD', '')
db_engine = create_engine(
    f'postgresql://{db_user}:{db_password}@localhost:5432/{db_name}'
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
    '../inputs/traffic_logs', '../outputs/traffic_logs')
pa.run(verbose=True)


db = fh.db_engine.DBEngine('../outputs/traffic_logs', db_engine=db_engine)
db.run(verbose=True)
