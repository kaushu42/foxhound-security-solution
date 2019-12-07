import os
import time

import utils
import config

engine = utils.get_db_engine()
session = utils.get_session(engine)

FILENAME = os.path.join(config.DUMPS_PATH, 'delete_rules.txt')
RULES_TABLE_NAME = 'rules_rule'
try:
    f = open(FILENAME)
    for index, line in enumerate(f):
        id = int(line.strip())
        utils.delete_using_id(engine, RULES_TABLE_NAME, id)
    print(f'{index+1} rules deleted!')
    f.close()
    os.remove(FILENAME)
except NameError:
    print('No rules to delete')
except FileNotFoundError:
    print('No rules to delete')
utils.unlock_rule_table(engine)
