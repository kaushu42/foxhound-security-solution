import os
import time

import utils
import config

engine = utils.get_db_engine()
session = utils.get_session(engine)

with open('/home/kaush/Desktop/file.txt', 'w') as f1:
    FILENAME = os.path.join(config.DUMPS_PATH, 'delete_rules.txt')
    RULES_TABLE_NAME = 'rules_rule'
    try:
        time.sleep(2)
        f = open(FILENAME)
        for index, line in enumerate(f):
            id = int(line.strip())
            utils.delete_using_id(engine, RULES_TABLE_NAME, id)
        os.remove(FILENAME)
        f1.write('\nrunning')

        print(f'{index+1} rules deleted!')
        utils.unlock_rule_table(engine)
    except NameError:
        print('No rules to delete')
    except FileNotFoundError:
        print('No rules to delete')
    f.write('\nDB unlocked')
