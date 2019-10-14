import foxhound as fh
import time

start = time.time()
print('Start on: ', start)
# Run the DC Engine for PaloAlto
pa = fh.dc_engine.PaloAltoEngine(
    '../inputs/traffic_logs', '../outputs/traffic_logs')
pa.run(verbose=False)

print('*'*80)
print('DC ENGINE Time: ', time.time() - start)
print('*'*80)

start = time.time()
print('Start on: ', start)

# Run the DB Engine
db = fh.db_engine.DBEngine('../outputs/traffic_logs')
db.run(table_name='dc_engine', verbose=False)

print('*'*80)
print('DB ENGINE Time: ', time.time() - start)
print('*'*80)
