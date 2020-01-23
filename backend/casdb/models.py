import uuid
from cassandra.cqlengine import columns
from django_cassandra_engine.models import DjangoCassandraModel


class TrafficLogs(DjangoCassandraModel):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    source_ip = columns.Text(required=False)
    destination_ip = columns.Text(required=False)
    application = columns.Text(required=False)
    protocol = columns.Text(required=False)
    source_zone = columns.Text(required=False)
    destination_zone = columns.Text(required=False)
    firewall_rule = columns.Integer(required=False)
    inbound_interface = columns.Text(required=False)
    outbound_interface = columns.Text(required=False)
    action = columns.Text(required=False)
    category = columns.Text(required=False)
    session_end_reason = columns.Text(required=False)
    row_number = columns.BigInt(required=False)
    source_port = columns.Integer(required=False)
    destination_port = columns.Integer(required=False)
    bytes_sent = columns.BigInt(required=False)
    bytes_received = columns.BigInt(required=False)
    repeat_count = columns.Integer(required=False)
    packets_received = columns.BigInt(required=False)
    packets_sent = columns.BigInt(required=False)
    time_elapsed = columns.BigInt(required=False)
    logged_datetime = columns.Text(required=False)
