from django.db import models
from core.models import FirewallRule
import uuid
from cassandra.cqlengine import columns
from django_cassandra_engine.models import DjangoCassandraModel
import architect


class DailyIP(models.Model):
    logged_datetime = models.DateField(null=True)
    processed_datetime = models.DateField(null=True)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    alias = models.CharField(max_length=250, null=True)

    class Meta:
        abstract = True


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class DailySourceIP(DailyIP):
    source_address = models.CharField(max_length=250)

    def __str__(self):
        return self.source_address

    def __repr__(self):
        return self.source_address


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class DailyDestinationIP(DailyIP):
    destination_address = models.CharField(max_length=250)

    def __str__(self):
        return self.destination_address

    def __repr__(self):
        return self.destination_address


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class DailyApplication(models.Model):
    logged_datetime = models.DateField(null=True)
    processed_datetime = models.DateField(null=True)
    application_name = models.CharField(max_length=250)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)

    def __str__(self):
        return self.application_name

    def __repr__(self):
        return self.application_name


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class Daily(models.Model):
    logged_datetime = models.DateField(null=True)
    processed_datetime = models.DateField(null=True)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=250, null=True)
    avg_repeat_count = models.DecimalField(decimal_places=2, max_digits=10)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    def __str__(self):
        return f'{self.firewall_rule} | {self.source_zone} | {self.destination_zone} | {self.application} | {self.protocol}'

    def __repr__(self):
        return self.__str__()


class DailyBlacklistEvent(models.Model):
    logged_datetime = models.DateTimeField(null=True)
    processed_datetime = models.DateField(null=True)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    source_ip = models.CharField(max_length=250, null=True)
    destination_ip = models.CharField(max_length=250, null=True)
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=250, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    row_number = models.BigIntegerField(null=True)
    source_port = models.PositiveIntegerField(null=True)
    destination_port = models.PositiveIntegerField(null=True)
    bytes_sent = models.BigIntegerField(null=True)
    bytes_received = models.BigIntegerField(null=True)
    repeat_count = models.PositiveIntegerField(null=True)
    packets_received = models.BigIntegerField(null=True)
    packets_sent = models.BigIntegerField(null=True)
    time_elapsed = models.BigIntegerField(null=True)

    class Meta:
        abstract = True


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class DailyRequestFromBlackListEvent(DailyBlacklistEvent):
    pass


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class DailyResponseToBlackListEvent(DailyBlacklistEvent):
    pass


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class DailyPerSourceDestinationPair(models.Model):
    logged_datetime = models.DateTimeField(null=True)
    processed_datetime = models.DateField(null=True)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    source_ip = models.CharField(max_length=250, null=True)
    destination_ip = models.CharField(max_length=250, null=True)
    destination_port = models.PositiveIntegerField()
    avg_repeat_count = models.DecimalField(decimal_places=2, max_digits=10)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()


class MisDailySourceIP(DjangoCassandraModel):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    logged_datetime = columns.DateTime(required=False)
    processed_datetime = columns.DateTime(required=False)
    firewall_rule_id = columns.Integer(required=False)
    source_address = columns.Text(required=False)


class MisDailyDestinationIP(DjangoCassandraModel):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    logged_datetime = columns.DateTime(required=False)
    processed_datetime = columns.DateTime(required=False)
    firewall_rule_id = columns.Integer(required=False)
    destination_address = columns.Text(required=False)


class MisDailyApplication(DjangoCassandraModel):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    logged_datetime = columns.DateTime(required=False)
    processed_datetime = columns.DateTime(required=False)
    firewall_rule_id = columns.Integer(required=False)
    application_name = columns.Text(required=False)


class MisDaily(DjangoCassandraModel):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    logged_datetime = columns.DateTime(required=False)
    processed_datetime = columns.DateTime(required=False)
    firewall_rule_id = columns.Integer(required=False)
    source_zone = columns.Text(required=False)
    destination_zone = columns.Text(required=False)
    application = columns.Text(required=False)
    protocol = columns.Text(required=False)
    avg_repeat_count = columns.Float()
    sum_bytes_sent = columns.BigInt()
    sum_bytes_received = columns.BigInt()
    sum_packets_received = columns.BigInt()
    sum_packets_sent = columns.BigInt()
    sum_time_elapsed = columns.BigInt()
    count_events = columns.BigInt()


class MisDailyRequestFromBlackListEvent(DjangoCassandraModel):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    logged_datetime = columns.DateTime(required=False)
    processed_datetime = columns.DateTime(required=False)
    firewall_rule_id = columns.Text(required=False)
    source_ip = columns.Text(required=False)
    destination_ip = columns.Text(required=False)
    application = columns.Text(required=False)
    protocol = columns.Text(required=False)
    source_zone = columns.Text(required=False)
    destination_zone = columns.Text(required=False)
    inbound_interface = columns.Text(required=False)
    outbound_interface = columns.Text(required=False)
    action = columns.Text(required=False)
    category = columns.Text(required=False)
    session_end_reason = columns.Text(required=False)
    row_number = columns.BigInt()
    source_port = columns.Integer()
    destination_port = columns.Integer()
    bytes_sent = columns.BigInt()
    bytes_received = columns.BigInt()
    repeat_count = columns.Integer()
    packets_received = columns.BigInt()
    packets_sent = columns.BigInt()
    time_elapsed = columns.BigInt()


class MisDailyResponseToBlackListEvent(DjangoCassandraModel):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    logged_datetime = columns.DateTime(required=False)
    processed_datetime = columns.DateTime(required=False)
    firewall_rule_id = columns.Integer(required=False)
    source_ip = columns.Text(required=False)
    destination_ip = columns.Text(required=False)
    application = columns.Text(required=False)
    protocol = columns.Text(required=False)
    source_zone = columns.Text(required=False)
    destination_zone = columns.Text(required=False)
    inbound_interface = columns.Text(required=False)
    outbound_interface = columns.Text(required=False)
    action = columns.Text(required=False)
    category = columns.Text(required=False)
    session_end_reason = columns.Text(required=False)
    row_number = columns.BigInt()
    source_port = columns.Integer()
    destination_port = columns.Integer()
    bytes_sent = columns.BigInt()
    bytes_received = columns.BigInt()
    repeat_count = columns.Integer()
    packets_received = columns.BigInt()
    packets_sent = columns.BigInt()
    time_elapsed = columns.BigInt()


class MisDailyPerSourceDestinationPair(DjangoCassandraModel):
    id = columns.UUID(primary_key=True, default=uuid.uuid4)
    logged_datetime = columns.DateTime(required=False)
    processed_datetime = columns.DateTime(required=False)
    firewall_rule_id = columns.Integer(required=False)
    source_ip = columns.Text(required=False)
    destination_ip = columns.Text(required=False)
    destination_port = columns.Integer()
    avg_repeat_count = columns.Float()
    sum_bytes_sent = columns.BigInt()
    sum_bytes_received = columns.BigInt()
    sum_packets_received = columns.BigInt()
    sum_packets_sent = columns.BigInt()
    sum_time_elapsed = columns.BigInt()
    count_events = columns.BigInt()
