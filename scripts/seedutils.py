import os
import tarfile
import wget
import shutil

from foxhound.db_engine.core_models import (
    VirtualSystem, Tenant,
    Domain
)
import utils
import config

engine = utils.get_db_engine()
session = utils.get_session(engine)


def get_ip_db():
    DB_FILENAME = 'GeoLite2-City.mmdb'
    if not os.path.exists(
        os.path.join(config.BASE_PATH, DB_FILENAME)
    ):
        filename = wget.download(config.DATABASE_URL, out=config.BASE_PATH,)

        tar = tarfile.open(os.path.join(config.BASE_PATH, filename))
        tar.extractall(config.BASE_PATH)
        foldername = filename.split('.')[0]
        os.rename(
            os.path.join(config.BASE_PATH, foldername, DB_FILENAME),
            os.path.join(config.BASE_PATH, DB_FILENAME)
        )
        shutil.rmtree(foldername)
        os.remove(filename)
        print('\nDone')


def seed(run=True):
    if not run:
        return
    get_ip_db()
    utils.get_blacklisted_ip(engine)
    if session.query(VirtualSystem).count() == 0:
        print('Seeding database....')
        print('Creating Default Virtual System')
        default_vsys = VirtualSystem(code='default', name='default')
        session.add(default_vsys)
        session.flush()
        print('Creating Default Tenant')
        default_tenant = Tenant(
            virtual_system_id=default_vsys.id, name='default')
        session.add(default_tenant)
        session.flush()
        session.commit()
