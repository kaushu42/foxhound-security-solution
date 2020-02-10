import os
import re
import random
import ipaddress
import numpy as np
import pandas as pd
from datetime import datetime
from psycopg2 import sql, connect
from sqlalchemy import create_engine

class ThreatEngine(object):
    def __init__(self,db_engine,input_dir):
        self._db_engine = db_engine
        self._INPUT_DIR = input_dir
        self._REQUIRED_COLUMNS = ['Receive Time','Type', 'Threat/Content Type','Config Version','Source address',
                    'Destination address','Rule','Application', 'Virtual System','Source Zone', 
                    'Destination Zone', 'Inbound Interface','Outbound Interface', 'Log Action', 
                    'Repeat Count', 'Source Port', 'Destination Port','Flags', 'IP Protocol', 'Action',
                    'URL/Filename', 'Threat/Content Name', 'Category', 'Severity',
                    'Direction', 'Sequence Number', 'Action Flags', 'Source Country',
                    'Destination Country', 'cpadding', 'contenttype','url_idx', 'Device Name',
                    'file_url', 'thr_category', 'contentver','sig_flags']
        
        self._COLUMN_HEADERS = ['received_datetime','log_type','threat_content_type','config_version','source_ip','destination_ip',
                  'firewall_rule_id','application','virtual_system','source_zone','destination_zone','inbound_interface',
                  'outbound_interface','log_action','repeat_count','source_port','destination_port','flags',
                  'ip_protocol','action','url_filename','threat_content_name','category','severity','direction',
                  'sequence_number','action_flags','source_country','destination_country','cpadding',
                  'contenttype','url_idx','device_name','file_url','thr_category','contentver','sig_flags']
        
        self._FINAL_COLUMN_HEADERS = ['logged_datetime','processed_datetime','log_name','received_datetime','log_type','threat_content_type','config_version','source_ip','destination_ip',
                  'firewall_rule_id','application','virtual_system','source_zone','destination_zone','inbound_interface',
                  'outbound_interface','log_action','repeat_count','source_port','destination_port','flags',
                  'ip_protocol','action','url_filename','threat_content_name','category','severity','direction',
                  'sequence_number','action_flags','source_country','destination_country','cpadding',
                  'contenttype','url_idx','device_name','file_url','thr_category','contentver','sig_flags']
        print("Threat Engine Instantiating")
        
    def _get_date_from_csv_filename(self,csv_filename):
        d = re.findall(r'[0-9]+', csv_filename)
        #return f'{d[0]}/{d[1]}/{d[2]}' 
        return datetime(int(d[0]), int(d[1]), int(d[2]))
    
    def _read_csv(self,filename):
        self._csv_filename = filename
        self._df = pd.read_csv(os.path.join(self._INPUT_DIR,filename))
    
    def _preprocess(self):
        self._df = self._df[self._REQUIRED_COLUMNS]
        self._df.columns = self._COLUMN_HEADERS
        self._df["logged_datetime"] = self._get_date_from_csv_filename(self._csv_filename)
        self._df["processed_datetime"] = datetime.now()
        self._df["log_name"] = self._csv_filename
        self._df["received_datetime"] = pd.to_datetime(self._df["received_datetime"])
        self._df = self._df[self._FINAL_COLUMN_HEADERS]
        
    def _set_firewall_rules_id_to_data(self):
        firewall_rules = pd.read_sql_table('core_firewallrule', self._db_engine).set_index("name").to_dict()["id"]
        self._df["firewall_rule_id"] = self._df['firewall_rule_id'].map(firewall_rules)  

    def _resolve_country_from_ip(self):
        def resolve_country(ip,prev_country):
            if ipaddress.ip_address(ip).is_private:
                return "Nepal"
            return prev_country

        self._df['source_country'] = self._df.apply(lambda row: resolve_country(row['source_ip'],row["source_country"]), axis = 1)
        self._df['destination_country'] = self._df.apply(lambda row: resolve_country(row['destination_ip'],row["destination_country"]), axis = 1)
    
    def _show_df(self,n=5):
        print(self._df.head(n))
    
    def _return_df(self):
        return self._df
    
    def _write_df_to_db(self):
        self._df.to_sql('core_threatlogs', con=self._db_engine, if_exists='append',index=False)
              
    def run(self):
        for root, dirs, files in os.walk(self._INPUT_DIR):
            for file in files:
                if file.endswith(".csv"):
                    print(f"processing threat log: {file} inside threat engine")
                    self._read_csv(file)
                    self._preprocess()
                    self._set_firewall_rules_id_to_data()
                    self._resolve_country_from_ip()
                    self._show_df(10)
                    self._write_df_to_db()
