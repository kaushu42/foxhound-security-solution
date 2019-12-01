import os
import datetime

from tqdm import tqdm

import pandas as pd

from sqlalchemy.orm import sessionmaker

from foxhound.db_engine.core_models import (
    VirtualSystem,
    TrafficLog,
    FirewallRule
)

from foxhound.db_engine.troubleticket_models import (
    TroubleTicketAnomaly, TroubleTicketFollowUpAnomaly
)


class TTAnomaly:
    def __init__(self, input_dir, db_engine):
        if not os.path.exists(input_dir):
            raise Exception('Generate anomaly logs first')

        self._INPUT_DIR = input_dir
        self._FILES = self._get_files()
        Session = sessionmaker(bind=db_engine)
        self._SESSION = Session()

    def _get_files(self):
        files = [
            f for f in os.listdir(
                self._INPUT_DIR
            ) if f.endswith('.csv')
        ]
        if not files:
            raise Exception('No Logs to process')

        return files

    def _read_csv(self, path):
        return pd.read_csv(path)

    def _process_data(self, data):
        data.columns = ['row_number'] + [i for i in data.columns[1:]]
        data.set_index('row_number', inplace=True)
        return data

    def _get_processed_data(self, file):
        data = self._read_csv(os.path.join(self._INPUT_DIR, file))
        data = self._process_data(data)
        return data

    def _get_params(self, row):
        index, row_data = row
        return {
            'log_name': row_data.log_name,
            'vsys_name': row_data['virtual_system_id'],
            'source_ip': row_data['source_ip_id'],
            'destination_ip': row_data['destination_ip_id'],
            'log_record_number': index,
            'source_port': row_data['source_port_id'],
            'destination_port': row_data['destination_port_id'],
            'now': datetime.datetime.now(),
            'bytes_sent': row_data['bytes_sent'],
            'bytes_received': row_data['bytes_received'],
            'application': row_data['application_id'],
            'firewall_rule': row_data['firewall_rule_id'],
            'reasons': row_data['Reasons']
        }

    def _get_virtual_system(self, params):
        vsys_name = params['vsys_name']
        vsys = self._SESSION.query(VirtualSystem).filter_by(
            code=vsys_name)[0]
        return vsys

    def _get_traffic_log(self, params):
        log_name = params['log_name']
        traffic_log = self._SESSION.query(TrafficLog).filter_by(
            log_name=log_name,
        )
        # if traffic_log.count() != 1:
        #     raise Exception("Only 1 object must have been returned")
        if traffic_log.count() == 0:
            raise Exception("No logs")
        traffic_log = traffic_log[0]
        return traffic_log

    def _get_trouble_ticket(self, log, params):
        firewall_rule_id = self._SESSION.query(
            FirewallRule).filter_by(name=params['firewall_rule'])[0].id
        tt = TroubleTicketAnomaly(
            created_datetime=params['now'],
            is_closed=False,
            log_id=log.id,
            row_number=params['log_record_number'],
            firewall_rule_id=firewall_rule_id,
            assigned_to_id=1,
            reasons=params['reasons']
        )
        return tt

    def _get_trouble_ticket_follow_up(self, trouble_ticket, params):
        tt_log_followup = TroubleTicketFollowUpAnomaly(
            trouble_ticket_id=trouble_ticket.id,
            follow_up_datetime=params['now'],
            assigned_by_id=1,
            assigned_to_id=1,
            description='Anomaly detected'
        )
        return tt_log_followup

    def run(self):
        for f in self._FILES:
            if not f.endswith('csv'):
                continue
            data = self._get_processed_data(f)

            for row in tqdm(data.iterrows()):
                params = self._get_params(row)
                traffic_log = self._get_traffic_log(params)
                tt = self._get_trouble_ticket(traffic_log, params)
                self._SESSION.add(tt)
                self._SESSION.flush()
                tt_follow_up = self._get_trouble_ticket_follow_up(tt, params)
                self._SESSION.add(tt_follow_up)
            self._SESSION.commit()
