import os
import wget
import tarfile
import shutil

from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

import pandas as pd

import config


def delete_using_id(engine, table_name, id):
    engine.execute(f'DELETE from {table_name} where id={id};')


def get_blacklisted_ip(engine):
    print('Getting blacklist')
    filename = wget.download(config.BLACKLISTED_IP_URL,
                             out=config.BASE_PATH)
    df = pd.read_csv(filename, header=None)
    df.columns = ['ip_address']
    df.index.name = 'id'
    df.to_sql('core_blacklistedip', engine, if_exists='replace', index=True)
    print()
    os.remove(os.path.join(config.BASE_PATH, filename))


def get_session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    return session


def get_db_engine():
    db_name = os.environ.get(config.FH_DB_NAME, '')
    db_user = os.environ.get(config.FH_DB_USER, '')
    db_password = os.environ.get(config.FH_DB_PASSWORD, '')
    db_engine = create_engine(
        f'''
        postgresql://{db_user}:{db_password}@{config.HOST}:{config.PORT}/{db_name}
        '''.strip()
    )
    return db_engine
