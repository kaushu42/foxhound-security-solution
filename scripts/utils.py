import os
import wget
import tarfile
import shutil

from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

import pandas as pd

import config as cfg
import ast

try:
    import configparser
except:
    from six.moves import configparser

config = configparser.ConfigParser()

config.read('../config.ini')

PG_DRIVER = ast.literal_eval(config.get("SPARK", "PG_DRIVER"))
SPARK_MASTER_URL = ast.literal_eval(config.get("SPARK", "SPARK_MASTER_URL"))
CLUSTER_SEEDS = ast.literal_eval(config.get("SPARK", "CLUSTER_SEEDS"))
SPARK_APP_NAME = ast.literal_eval(config.get("SPARK", "SPARK_APP_NAME"))
SPARK_DB_URL = ast.literal_eval(config.get("SPARK", "SPARK_DB_URL"))
SPARK_DB_DRIVER = ast.literal_eval(config.get("SPARK", "SPARK_DB_DRIVER"))
SPARK_CASDB_DRIVER = ast.literal_eval(
    config.get("SPARK", "SPARK_CASDB_DRIVER"))


HOST = ast.literal_eval(config.get("POSTGRES", "host"))
DB_NAME = ast.literal_eval(config.get("POSTGRES", "db_name"))
FH_DB_USER = ast.literal_eval(config.get("POSTGRES", "username"))
FH_DB_PASSWORD = ast.literal_eval(config.get("POSTGRES", "password"))
PORT = ast.literal_eval(config.get("POSTGRES", "port"))

CAS_KEYSPACE = ast.literal_eval(config.get("CASSANDRA", "CAS_KEYSPACE"))


def delete_using_id(engine, table_name, id):
    engine.execute(f'DELETE from {table_name} where id={id};')


def unlock_rule_table(engine):
    engine.execute(
        f"UPDATE core_dblock set is_locked=false where table_name='rules_rule'"
    )


def get_blacklisted_ip(engine):
    print('Getting blacklist')
    filename = wget.download(cfg.BLACKLISTED_IP_URL,
                             out=cfg.BASE_PATH)
    df = pd.read_csv(filename, header=None)
    df.columns = ['ip_address']
    df.index.name = 'id'
    df.to_sql('core_blacklistedip', engine, if_exists='replace', index=True)
    print()
    os.remove(os.path.join(cfg.BASE_PATH, filename))


def get_session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    return session


def get_db_engine():
    db_engine = create_engine(
        f'''
        postgresql://{FH_DB_USER}:{FH_DB_PASSWORD}@{HOST}:{PORT}/{DB_NAME}
        '''.strip()
    )
    return db_engine
