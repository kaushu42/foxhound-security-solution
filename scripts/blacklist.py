import os
import pandas as pd
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker

import config

db_name = os.environ.get(config.FH_DB_NAME, '')
db_user = os.environ.get(config.FH_DB_USER, '')
db_password = os.environ.get(config.FH_DB_PASSWORD, '')
db_engine = create_engine(
    f'postgresql://{db_user}:{db_password}@{config.HOST}:{config.PORT}/{db_name}'
)

df = pd.read_csv('greensnow.txt')
df.to_sql('core_blacklistedip', db_engine, if_exists='append', index=True)
