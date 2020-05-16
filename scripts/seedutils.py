import os
import tarfile
import wget
import shutil

from foxhound.db_engine.core_models import (
    VirtualSystem, Tenant, FirewallRule,
    Domain
)
import utils
import config

engine = utils.get_db_engine()
session = utils.get_session(engine)

indexes_to_create = {
    'fh_prd_trfc_log_dtl_f': ['firewall_rule_id'],
}


def create_indices():
    session.execute()


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


def seed_threatdb():
    items = set()
    for file in os.listdir(config.THREAT_DB_PATH):
        filepath = os.path.join(config.THREAT_DB_PATH, file)
        items = items | set(open(filepath).read().split('\n'))
    items = items - {""}
    with open('threatdb.sql', 'w') as f:
        for i in items:
            f.write(
                f"INSERT INTO core_blacklistedip(ip_address) VALUES('{i}');\n")


def seed(run=True):
    if not run:
        return
    # get_ip_db()

    # utils.get_blacklisted_ip(engine)
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
        print('Creating Default Firewall Rule')
        default_fw_rule = FirewallRule(
            tenant_id=default_tenant.id, name='default')
        session.add(default_fw_rule)
        session.flush()
        session.commit()
