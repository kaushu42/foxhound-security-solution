from django.db import models
from rest_framework import serializers

import architect


class VirtualSystem(models.Model):
    code = models.CharField(max_length=20, unique=True, null=False)
    name = models.CharField(max_length=100, unique=True, null=False)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class Tenant(models.Model):
    virtual_system = models.ForeignKey(
        VirtualSystem, on_delete=models.CASCADE,
        null=True
    )
    name = models.CharField(max_length=250)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class FirewallRule(models.Model):
    name = models.CharField(max_length=250)
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class Domain(models.Model):
    name = models.CharField(max_length=250
                            )
    url = models.CharField(max_length=250)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE,
                               null=True
                               )

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class TrafficLog(models.Model):
    processed_datetime = models.DateField(auto_now_add=True)
    log_date = models.DateField()
    log_name = models.CharField(max_length=200)
    is_log_detail_written = models.BooleanField(null=True, default=False)
    is_rule_written = models.BooleanField(null=True, default=False)
    is_info_written = models.BooleanField(null=True, default=False)
    is_granular_hour_written = models.BooleanField(null=True, default=False)

    def __repr__(self):
        return self.log_name

    def __str__(self):
        return self.__repr__()


class IPAddress(models.Model):
    address = models.CharField(max_length=15)
    alias = models.CharField(max_length=200, null=True)

    def __str__(self):
        return self.address

    def __repr__(self):
        return self.address


class ModelWithName(models.Model):
    class Meta:
        abstract = True

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class Application(ModelWithName):
    pass


class Protocol(ModelWithName):
    pass


class Zone(ModelWithName):
    pass


class FirewallRuleZone(models.Model):
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True
    )
    source_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE,
        related_name='firewall_source_zone', null=True
    )
    destination_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE,
        related_name='firewall_destination_zone', null=True
    )

    def __str__(self):
        return f'{self.firewall_rule}:{self.source_zone}-{self.destination_zone}'

    def __repr__(self):
        return self.__str__()


class SessionEndReason(ModelWithName):
    pass


class Category(ModelWithName):
    pass


class Action(ModelWithName):
    pass


class Interface(ModelWithName):
    pass


@architect.install(
    'partition', type='range',
    subtype='date', constraint='month',
    column='logged_datetime'
)
class TrafficLogDetail(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE, null=True
    )
    source_ip = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE, null=True,
        related_name='source_ip'
    )
    destination_ip = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE, null=True,
        related_name='destination_ip'
    )
    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, null=True,
        related_name='application'
    )
    protocol = models.ForeignKey(
        Protocol, on_delete=models.CASCADE, null=True,
        related_name='protocol'
    )
    source_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE, null=True,
        related_name='source_zone'
    )
    destination_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE, null=True,
        related_name='destination_zone'
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True,
        related_name='firewall_rule'
    )
    inbound_interface = models.ForeignKey(
        Interface, on_delete=models.CASCADE, null=True,
        related_name='inbound_interface'
    )
    outbound_interface = models.ForeignKey(
        Interface, on_delete=models.CASCADE, null=True,
        related_name='outbound_interface'
    )
    action = models.ForeignKey(
        Action, on_delete=models.CASCADE, null=True,
        related_name='action'
    )
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, null=True,
        related_name='category'
    )
    session_end_reason = models.ForeignKey(
        SessionEndReason, on_delete=models.CASCADE, null=True,
        related_name='session_end_reason'
    )
    row_number = models.BigIntegerField()
    source_port = models.PositiveIntegerField()
    destination_port = models.PositiveIntegerField()
    bytes_sent = models.BigIntegerField()
    bytes_received = models.BigIntegerField()
    repeat_count = models.PositiveIntegerField()
    packets_received = models.BigIntegerField()
    packets_sent = models.BigIntegerField()
    time_elapsed = models.BigIntegerField()
    logged_datetime = models.DateTimeField(auto_now_add=True)

    def __repr__(self):
        return f'Log-{self.traffic_log}:{self.row_number}'

    def __str__(self):
        return self.__repr__()


class Country(models.Model):
    ip_address = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE,
        null=True
    )
    name = models.CharField(max_length=250)
    iso_code = models.CharField(max_length=5)

    def __repr__(self):
        return f'{self.ip_address}-{self.iso_code}'

    def __str__(self):
        return self.__repr__()


class BlacklistedIP(models.Model):
    ip_address = models.CharField(max_length=15)

    def __repr__(self):
        return self.ip_address

    def __str__(self):
        return self.__repr__()


class TenantInfo(models.Model):
    class Meta:
        abstract = True

    firewall_rule = models.ForeignKey(
        FirewallRule,
        on_delete=models.CASCADE,
        null=True
    )
    created_date = models.DateField(auto_now=True, null=True)


class TenantIPAddressInfo(TenantInfo):
    address = models.CharField(max_length=15)
    alias = models.CharField(max_length=250, null=True)

    def __repr__(self):
        return f'{self.firewall_rule.tenant}-{self.address}'

    def __str__(self):
        return self.__repr__()


class TenantApplicationInfo(TenantInfo):
    application = models.CharField(max_length=250)

    def __repr__(self):
        return f'{self.firewall_rule.tenant}-{self.application}'

    def __str__(self):
        return self.__repr__()


class ProcessedLogDetail(models.Model):
    firewall_rule = models.ForeignKey(
        FirewallRule,
        on_delete=models.CASCADE,
        null=True
    )
    log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE,
        null=True
    )
    n_rows = models.IntegerField(default=0)
    size = models.BigIntegerField(default=0)

    def __repr__(self):
        return f'{self.firewall_rule}-{self.n_rows}-{self.size}'

    def __str__(self):
        return self.__repr__()


@architect.install(
    'partition', type='range',
    subtype='date', constraint='month',
    column='logged_datetime'
)
class TrafficLogDetailGranularHour(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE, null=True
    )
    source_ip = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_source_ip'
    )
    destination_ip = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_destination_ip'
    )
    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_application'
    )
    protocol = models.ForeignKey(
        Protocol, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_protocol'
    )
    source_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_source_zone'
    )
    destination_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_destination_zone'
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_firewall_rule'
    )
    inbound_interface = models.ForeignKey(
        Interface, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_inbound_interface'
    )
    outbound_interface = models.ForeignKey(
        Interface, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_outbound_interface'
    )
    action = models.ForeignKey(
        Action, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_action'
    )
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_category'
    )
    session_end_reason = models.ForeignKey(
        SessionEndReason, on_delete=models.CASCADE, null=True,
        related_name='granular_hour_session_end_reason'
    )
    destination_port = models.PositiveIntegerField()
    bytes_sent = models.BigIntegerField()
    bytes_received = models.BigIntegerField()
    repeat_count = models.PositiveIntegerField()
    packets_received = models.BigIntegerField()
    packets_sent = models.BigIntegerField()
    time_elapsed = models.BigIntegerField()
    logged_datetime = models.DateTimeField()

    def __repr__(self):
        return f'Log-{self.traffic_log}:{self.row_number}'

    def __str__(self):
        return self.__repr__()


class DBLock(models.Model):
    table_name = models.CharField(max_length=80, null=True, unique=True)
    is_locked = models.BooleanField(default=False)

    def __repr__(self):
        return f'{self.is_locked}'

    def __str__(self):
        return self.__repr__()


class CeleryTaskmeta(models.Model):
    id = models.IntegerField(primary_key=True)
    task_id = models.CharField(
        unique=True, max_length=155, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    result = models.BinaryField(blank=True, null=True)
    date_done = models.DateTimeField(blank=True, null=True)
    traceback = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'celery_taskmeta'


class CeleryTasksetmeta(models.Model):
    id = models.IntegerField(primary_key=True)
    taskset_id = models.CharField(
        unique=True, max_length=155, blank=True, null=True)
    result = models.BinaryField(blank=True, null=True)
    date_done = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'celery_tasksetmeta'


class BackgroundJob(models.Model):
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="tenant_background_job")
    task = models.ForeignKey(
        CeleryTasksetmeta, on_delete=models.CASCADE, related_name="task_background_job")


class Filter(models.Model):
    application = models.CharField(max_length=250)
    source_zone = models.CharField(max_length=250)
    destination_zone = models.CharField(max_length=250)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    protocol = models.CharField(max_length=10)


class StagingFilter(models.Model):
    application = models.CharField(max_length=250)
    source_zone = models.CharField(max_length=250)
    destination_zone = models.CharField(max_length=250)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    protocol = models.CharField(max_length=10)


class RequestOriginChart(models.Model):
    filter = models.ForeignKey(Filter, on_delete=models.CASCADE)
    country_name = models.CharField(max_length=100)
    country_code = models.CharField(max_length=10)
    count = models.BigIntegerField()


class ApplicationChart(models.Model):
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    logged_datetime = models.DateTimeField()
    application = models.CharField(max_length=250)
    bytes = models.BigIntegerField()


class TimeSeriesChart(models.Model):
    filter = models.ForeignKey(Filter, on_delete=models.CASCADE)
    logged_datetime = models.DateTimeField()
    bytes_sent = models.BigIntegerField()
    bytes_received = models.BigIntegerField()


class IPChart(models.Model):
    filter = models.ForeignKey(Filter, on_delete=models.CASCADE)
    logged_datetime = models.DateTimeField()
    address = models.CharField(max_length=15)
    bytes_sent = models.BigIntegerField()
    bytes_received = models.BigIntegerField()
