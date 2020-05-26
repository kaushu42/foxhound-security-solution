import os
import ast
import configparser

FILE_PATH = os.path.abspath(__file__)
PACKAGE_PATH = os.path.dirname(FILE_PATH)
config_path = os.path.join(PACKAGE_PATH, '../config.ini')

config = configparser.ConfigParser()
config.read(config_path)


class Config:
    SPARK_DB_URL = ast.literal_eval(config.get("SPARK", "SPARK_DB_URL"))
    SPARK_DB_DRIVER = ast.literal_eval(config.get("SPARK", "SPARK_DB_DRIVER"))
    FH_DB_USER = ast.literal_eval(config.get("POSTGRES", "username"))
    FH_DB_PASSWORD = ast.literal_eval(config.get("POSTGRES", "password"))
