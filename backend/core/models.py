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
    mis_engine_ran = models.BooleanField(null=True)
    chart_engine_ran = models.BooleanField(null=True)
    db_engine_ran = models.BooleanField(null=True)
    dc_engine_ran = models.BooleanField(null=True)
    ml_engine_ran = models.BooleanField(null=True)

    def __repr__(self):
        return self.log_name

    def __str__(self):
        return self.__repr__()


class IPAddress(models.Model):
    address = models.CharField(max_length=15)
    alias = models.CharField(max_length=200, null=True)
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True
    )

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
        return f'{self.firewall_rule}'

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
    log = models.CharField(max_length=250, null=True)
    rows = models.IntegerField(default=0)
    processed_date = models.DateField(null=True)

    def __repr__(self):
        return f'{self.log}'

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
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True,
        related_name='firewall_rule_granular_hour'
    )

    source_ip = models.CharField(max_length=50, null=True)
    destination_ip = models.CharField(max_length=50, null=True)
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=50, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    destination_port = models.PositiveIntegerField()
    bytes_sent = models.BigIntegerField()
    bytes_received = models.BigIntegerField()
    repeat_count = models.PositiveIntegerField()
    packets_received = models.BigIntegerField()
    packets_sent = models.BigIntegerField()
    time_elapsed = models.BigIntegerField()
    logged_datetime = models.DateTimeField()
    source_country = models.CharField(max_length=3, null=True)
    destination_country = models.CharField(max_length=3, null=True)

    def __repr__(self):
        return f'Log-{self.traffic_log}'

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
        Tenant, on_delete=models.CASCADE,
        related_name="tenant_background_job")
    task_id = models.CharField(
        unique=True, max_length=155, blank=True, null=True)


class BaseFilter(models.Model):
    class Meta:
        abstract = True
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    protocol = models.ForeignKey(Protocol, on_delete=models.CASCADE)


class Filter(BaseFilter):
    source_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE, related_name=f'filter_source_zone')
    destination_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE, related_name='filter_destination_zone')


class BaseChart(models.Model):
    class Meta:
        abstract = True
    bytes_sent = models.BigIntegerField()
    bytes_received = models.BigIntegerField()
    packets_sent = models.BigIntegerField()
    packets_received = models.BigIntegerField()
    count = models.BigIntegerField(default=0)


class BaseFilteredChart(BaseChart):
    class Meta:
        abstract = True
    filter = models.ForeignKey(Filter, on_delete=models.CASCADE)


class StagingFilter(BaseFilter):
    source_zone_id = models.IntegerField()
    destination_zone_id = models.IntegerField()


class ApplicationChart(BaseChart):
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    logged_datetime = models.DateTimeField()
    application = models.ForeignKey(Application, on_delete=models.CASCADE)


class RequestOriginChart(BaseFilteredChart):
    country_name = models.CharField(max_length=100)
    country_code = models.CharField(max_length=10)


class TimeSeriesChart(BaseFilteredChart):
    logged_datetime = models.DateTimeField()


class IPChart(BaseFilteredChart):
    logged_datetime = models.DateTimeField()
    address = models.CharField(max_length=15)


class SankeyChart(BaseFilteredChart):
    logged_datetime = models.DateTimeField()
    source_ip = models.CharField(max_length=15)
    destination_ip = models.CharField(max_length=15)
