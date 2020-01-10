class MISEngine(object):
    def __init__(self, spark_session, db_engine, input_dir, output_dir):
        self._spark = spark_session
        self._input_dir = input_dir
        self._output_dir = output_dir
        self._db_engine = db_engine
        self._REQUIRED_COLUMNS = [
            'Source address', 'Destination address', 'Application',
            'IP Protocol', 'Source Zone', 'Destination Zone', 'Rule',
            'Inbound Interface', 'Outbound Interface', 'Action', 'Category',
            'Session End Reason', 'Sequence Number', 'Source Port', 'Destination Port',
            'Bytes Sent', 'Bytes Received', 'Repeat Count', 'Packets Received', 'Packets Sent',
            'Start Time', 'Elapsed Time (sec)', 'Virtual System']
        self._HEADER_NAMES = [
            "source_ip", "destination_ip", "application",
            "protocol", "source_zone", "destination_zone", "firewall_rule",
            "inbound_interface", "outbound_interface", "action", "category",
            "session_end_reason", "row_number", "source_port", "destination_port",
            "bytes_sent", "bytes_received", "repeat_count", "packets_received",
            "packets_sent", "logged_datetime", "time_elapsed", 'vsys']
