import os
import logging
import time
import datetime
import psutil
import json

import numpy as np
import pandas as pd
from tqdm import tqdm

import config

BASE_PATH = config.TRAFFIC_LOGS_INPUT_DIR
FILES = os.listdir(BASE_PATH)
OUTPUT_PATH = config.GRANULARIZED_LOG_PATH
LOG_FILE = os.path.join(config.LOG_PATH, f'{__file__}.log')

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.DEBUG
)
logging.info(f'Script ran on {datetime.datetime.now()}')
try:
    for f in tqdm(FILES):
        start_time = time.time()

        filepath = os.path.join(BASE_PATH, f)

        logging.info(f'Processing file {filepath}')

        df = pd.read_csv(filepath)
        drop_columns = [
            'Domain', 'Receive Time', 'Serial #', 'Type', 'Source Port',
            'Threat/Content Type', 'Config Version', 'Generate Time',
            'NAT Source IP', 'NAT Destination IP', 'Source User',
            'Destination User', 'Log Action', 'Time Logged', 'Session ID',
            'NAT Source Port', 'NAT Destination Port',
            'Flags', 'tpadding', 'Sequence Number', 'Action Flags',
            'DG Hierarchy Level 1', 'DG Hierarchy Level 2', 'DG Hierarchy Level 3',
            'DG Hierarchy Level 4', 'Virtual System Name', 'Device Name',
            'Action Source', 'Source VM UUID', 'Destination VM UUID',
            'Tunnel ID/IMSI', 'Monitor Tag/IMEI', 'Parent Session ID',
            'Parent Session Start Time', 'Tunnel', 'cpadding',
            'SCTP Association ID', 'SCTP Chunks', 'SCTP Chunks Sent',
            'SCTP Chunks Received', 'Source Country', 'Destination Country',
        ]

        df.drop(drop_columns, axis=1, inplace=True)
        df['date'] = pd.to_datetime(df['Start Time'])
        df.set_index('date', inplace=True)
        df.index = df.index.floor('1H')
        df.drop(['Start Time'], axis=1, inplace=True)
        group_columns = [
            'date', 'Source address', 'Destination address', 'Rule',
            'Application', 'Virtual System', 'Source Zone',
            'Destination Zone', 'Inbound Interface', 'Outbound Interface',
            'Destination Port', 'IP Protocol', 'Action',
            'Category', 'Session End Reason'
        ]
        df = df.groupby(group_columns)
        df = df.agg({
            'Repeat Count': 'mean',
            'Bytes': 'sum',
            'Bytes Sent': 'sum',
            'Bytes Received': 'sum',
            'Packets': 'sum',
            'Elapsed Time (sec)': 'sum',
            'Packets Sent': 'sum',
            'Packets Received': 'sum'
        }).reset_index()
        df.rename({
            'date': 'logged_datetime',
            'Source address': 'source_ip_id',
            'Destination address': 'destination_ip_id',
            'Rule': 'firewall_rule_id',
            'Application': 'application_id',
            'Virtual System': 'virtual_system_id',
            'Source Zone': 'source_zone_id',
            'Destination Zone': 'destination_zone_id',
            'Inbound Interface': 'inbound_interface_id',
            'Outbound Interface': 'outbound_interface_id',
            'Destination Port': 'destination_port',
            'IP Protocol': 'protocol_id',
            'Action': 'action_id',
            'Category': 'category_id',
            'Session End Reason': 'session_end_reason_id',
            'Repeat Count': 'repeat_count',
            'Bytes': 'bytes',
            'Bytes Sent': 'bytes_sent',
            'Bytes Received': 'bytes_received',
            'Packets': 'packets',
            'Elapsed Time (sec)': 'elapsed_time',
            'Packets Sent': 'packets_sent',
            'Packets Received': 'packets_received'
        }, axis=1, inplace=True)
        df.logged_datetime = df.logged_datetime.values.astype(
            np.int64) // 10 ** 9
        df.to_csv(os.path.join(OUTPUT_PATH, f))
        end_time = time.time()
        logging.info(f'Time taken: {end_time - start_time} seconds')
except Exception as e:
    logging.exception(e)
    logging.info(f'Script finished on {datetime.datetime.now()}')
    raise(e)
logging.info(f'Script finished on {datetime.datetime.now()}')
