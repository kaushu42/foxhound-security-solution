import foxhound as fh
import time

pa = fh.dc_engine.PaloAltoEngine(
    '../inputs/traffic_logs', '../outputs/traffic_logs')
pa.run(verbose=True)

db = fh.db_engine.DBEngine('../outputs/traffic_logs')
db.run(table_name='core_log', verbose=True)
