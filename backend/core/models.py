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

    class Meta:
        db_table = 'fh_prd_fw_rule_f'


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


class Log(models.Model):
    class Meta:
        abstract = True
    processed_datetime = models.DateTimeField(auto_now_add=True)
    log_date = models.DateField()
    log_name = models.CharField(max_length=500, unique=True)


class TrafficLog(Log):
    def __repr__(self):
        return self.log_name

    def __str__(self):
        return self.__repr__()

    class Meta:
        db_table = 'fh_prd_trfc_log_f'


class ThreatLog(Log):
    def __repr__(self):
        return self.log_name

    def __str__(self):
        return self.__repr__()

    class Meta:
        db_table = 'fh_prd_thrt_log_f'


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
    class Meta:
        db_table = 'fh_prd_trfc_appl_f'


class Protocol(ModelWithName):
    class Meta:
        db_table = 'fh_prd_trfc_prot_f'


class Zone(ModelWithName):
    class Meta:
        db_table = 'fh_prd_trfc_zone_f'


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
    class Meta:
        db_table = 'fh_prd_trfc_sess_end_f'


class Category(ModelWithName):
    pass


class Action(ModelWithName):
    pass


class Interface(ModelWithName):
    pass


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class TrafficLogDetail(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE, null=True
    )
    source_address = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE, null=True,
        related_name='source_address'
    )
    destination_address = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE, null=True,
        related_name='destination_address'
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
    processed_datetime = models.DateTimeField(null=True)

    def __repr__(self):
        return f'{self.log}'

    def __str__(self):
        return self.__repr__()

    class Meta:
        abstract = True


class ProcessedTrafficLogDetail(ProcessedLogDetail):
    class Meta:
        db_table = 'fh_prd_trfc_log_dtl_f'


class ProcessedThreatLogDetail(ProcessedLogDetail):
    class Meta:
        db_table = 'fh_prd_thrt_log_dtl_f'


class StageTrafficLogDetail(ProcessedLogDetail):
    class Meta:
        db_table = 'fh_stg_trfc_log_dtl_f'


class StageThreatLogDetail(ProcessedLogDetail):
    class Meta:
        db_table = 'fh_stg_thrt_log_dtl_f'


class StageApplication(ModelWithName):
    class Meta:
        db_table = 'fh_stg_trfc_appl_f'


class StageProtocol(ModelWithName):
    class Meta:
        db_table = 'fh_stg_trfc_prot_f'


class StageZone(ModelWithName):
    class Meta:
        db_table = 'fh_stg_trfc_zone_f'


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
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

    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
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


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class TrafficLogDetailHourly(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE, null=True
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True,
        related_name='firewall_rule_prod_traffic_log_detail_hourly'
    )
    logged_datetime = models.DateTimeField()
    threat_content_type = models.CharField(max_length=50, null=True)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    nat_source_ip = models.CharField(max_length=50, null=True)
    nat_destination_ip = models.CharField(max_length=50, null=True)
    destination_port = models.PositiveIntegerField()
    nat_destination_port = models.PositiveIntegerField()
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=50, null=True)
    log_action = models.CharField(max_length=50, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    source_country = models.CharField(max_length=3, null=True)
    destination_country = models.CharField(max_length=3, null=True)
    device_name = models.CharField(max_length=250, null=True)
    flags = models.CharField(max_length=50, null=True)
    vsys = models.CharField(max_length=50, null=True)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    avg_repeat_count = models.PositiveIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    def __repr__(self):
        return f'Log-{self.traffic_log}'

    def __str__(self):
        return self.__repr__()

    class Meta:
        db_table = 'fh_prd_trfc_log_dtl_hr_a'


class StageTrafficLogDetailHourly(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE, null=True
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True,
        related_name='firewall_rule_stage_traffic_log_detail_hourly'
    )
    logged_datetime = models.DateTimeField()
    threat_content_type = models.CharField(max_length=50, null=True)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    nat_source_ip = models.CharField(max_length=50, null=True)
    nat_destination_ip = models.CharField(max_length=50, null=True)
    destination_port = models.PositiveIntegerField()
    nat_destination_port = models.PositiveIntegerField()
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=50, null=True)
    log_action = models.CharField(max_length=50, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    source_country = models.CharField(max_length=3, null=True)
    destination_country = models.CharField(max_length=3, null=True)
    device_name = models.CharField(max_length=250, null=True)
    flags = models.CharField(max_length=50, null=True)
    vsys = models.CharField(max_length=50, null=True)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    avg_repeat_count = models.PositiveIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    def __repr__(self):
        return f'Log-{self.traffic_log}'

    def __str__(self):
        return self.__repr__()

    class Meta:
        db_table = 'fh_stg_trfc_log_dtl_hr_a'


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class TrafficLogDetailDaily(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE, null=True
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True,
        related_name='firewall_rule_prod_traffic_log_detail_daily'
    )
    logged_datetime = models.DateTimeField()
    threat_content_type = models.CharField(max_length=50, null=True)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    nat_source_ip = models.CharField(max_length=50, null=True)
    nat_destination_ip = models.CharField(max_length=50, null=True)
    destination_port = models.PositiveIntegerField()
    nat_destination_port = models.PositiveIntegerField()
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=50, null=True)
    log_action = models.CharField(max_length=50, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    source_country = models.CharField(max_length=3, null=True)
    destination_country = models.CharField(max_length=3, null=True)
    device_name = models.CharField(max_length=250, null=True)
    flags = models.CharField(max_length=50, null=True)
    vsys = models.CharField(max_length=50, null=True)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    avg_repeat_count = models.PositiveIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    def __repr__(self):
        return f'Log-{self.traffic_log}'

    def __str__(self):
        return self.__repr__()

    class Meta:
        db_table = 'fh_prd_trfc_log_dtl_dy_a'


class StageTrafficLogDetailDaily(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE, null=True
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True,
        related_name='firewall_rule_stage_traffic_log_detail_daily'
    )
    logged_datetime = models.DateTimeField()
    threat_content_type = models.CharField(max_length=50, null=True)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    nat_source_ip = models.CharField(max_length=50, null=True)
    nat_destination_ip = models.CharField(max_length=50, null=True)
    destination_port = models.PositiveIntegerField()
    nat_destination_port = models.PositiveIntegerField()
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=50, null=True)
    log_action = models.CharField(max_length=50, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    source_country = models.CharField(max_length=3, null=True)
    destination_country = models.CharField(max_length=3, null=True)
    device_name = models.CharField(max_length=250, null=True)
    flags = models.CharField(max_length=50, null=True)
    vsys = models.CharField(max_length=50, null=True)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    avg_repeat_count = models.PositiveIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    def __repr__(self):
        return f'Log-{self.traffic_log}'

    def __str__(self):
        return self.__repr__()

    class Meta:
        db_table = 'fh_stg_trfc_log_dtl_dy_a'


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
    class Meta:
        db_table = 'fh_prd_trfc_fltr_f'
    source_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE, related_name=f'filter_source_zone')
    destination_zone = models.ForeignKey(
        Zone, on_delete=models.CASCADE, related_name='filter_destination_zone')


class BaseChart(models.Model):
    class Meta:
        abstract = True
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    count_events = models.BigIntegerField(default=0)


class BaseFilteredChart(BaseChart):
    class Meta:
        abstract = True
    filter = models.ForeignKey(Filter, on_delete=models.CASCADE)


class StagingFilter(BaseFilter):
    class Meta:
        db_table = 'fh_stg_trfc_fltr_f'
    source_zone_id = models.IntegerField()
    destination_zone_id = models.IntegerField()


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class ApplicationChart(BaseChart):
    class Meta:
        db_table = 'fh_prd_trfc_chrt_app_dt_hr_a'
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    logged_datetime = models.DateTimeField()
    application = models.ForeignKey(Application, on_delete=models.CASCADE)


class RequestOriginChart(BaseFilteredChart):
    class Meta:
        db_table = 'fh_prd_trfc_chrt_req_org_dt_hr_a'
    country_name = models.CharField(max_length=100)
    country_code = models.CharField(max_length=10)


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class TimeSeriesChart(BaseFilteredChart):
    class Meta:
        db_table = 'fh_prd_trfc_chrt_tm_srs_dt_hr_a'
    logged_datetime = models.DateTimeField()


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class IPChart(BaseFilteredChart):
    class Meta:
        db_table = 'fh_prd_trfc_chrt_ip_dt_hr_a'
    logged_datetime = models.DateTimeField()
    address = models.CharField(max_length=15)


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class SankeyChart(BaseFilteredChart):
    class Meta:
        db_table = 'fh_prd_trfc_chrt_con_dt_hr_a'
    logged_datetime = models.DateTimeField()
    source_address = models.CharField(max_length=15)
    destination_address = models.CharField(max_length=15)

# TODO: DROP THIS TABLE


class ThreatLogDetail(models.Model):
    logged_datetime = models.DateTimeField()
    processed_datetime = models.DateTimeField()
    log_name = models.CharField(max_length=500, null=False)
    received_datetime = models.DateTimeField()
    log_type = models.CharField(max_length=300, null=True)
    threat_content_type = models.CharField(max_length=300, null=True)
    config_version = models.CharField(max_length=300, null=True)
    source_address = models.CharField(max_length=300, null=True)
    destination_address = models.CharField(max_length=300, null=True)
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE,
        related_name='threat_log_firewall_rule_id', null=True)
    application = models.CharField(max_length=300, null=True)
    virtual_system = models.CharField(max_length=300, null=True)
    source_zone = models.CharField(max_length=300, null=True)
    destination_zone = models.CharField(max_length=300, null=True)
    inbound_interface = models.CharField(max_length=300, null=True)
    outbound_interface = models.CharField(max_length=300, null=True)
    log_action = models.CharField(max_length=300, null=True)
    repeat_count = models.IntegerField(null=True)
    source_port = models.IntegerField(null=True)
    destination_port = models.IntegerField(null=True)
    flags = models.CharField(max_length=300, null=True)
    protocol = models.CharField(max_length=300, null=True)
    action = models.CharField(max_length=300, null=True)
    url_filename = models.CharField(max_length=300, null=True)
    threat_content_name = models.CharField(max_length=300, null=True)
    category = models.CharField(max_length=300, null=True)
    severity = models.CharField(max_length=300, null=True)
    direction = models.CharField(max_length=300, null=True)
    sequence_number = models.CharField(max_length=300, null=True)
    action_flags = models.CharField(max_length=300, null=True)
    source_country = models.CharField(max_length=300, null=True)
    destination_country = models.CharField(max_length=300, null=True)
    cpadding = models.CharField(max_length=300, null=True)
    contenttype = models.CharField(max_length=300, null=True)
    url_idx = models.CharField(max_length=300, null=True)
    device_name = models.CharField(max_length=300, null=True)
    file_url = models.CharField(max_length=300, null=True)
    thr_category = models.CharField(max_length=300, null=True)
    contentver = models.CharField(max_length=300, null=True)
    sig_flags = models.CharField(max_length=300, null=True)


class ThreatLogDetailEvent(models.Model):
    threat_log = models.ForeignKey(
        ThreatLog, on_delete=models.CASCADE,
        related_name='prod_threat_log_traffic_log_id', null=True)
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE,
        related_name='prod_threat_log_firewall_rule_id', null=True)
    received_datetime = models.DateTimeField()
    log_type = models.CharField(max_length=300, null=True)
    threat_content_type = models.CharField(max_length=300, null=True)
    config_version = models.CharField(max_length=300, null=True)
    source_address = models.CharField(max_length=300, null=True)
    destination_address = models.CharField(max_length=300, null=True)
    nat_source_ip = models.CharField(max_length=300, null=True)
    nat_destination_ip = models.CharField(max_length=300, null=True)
    application = models.CharField(max_length=300, null=True)
    virtual_system = models.CharField(max_length=300, null=True)
    source_zone = models.CharField(max_length=300, null=True)
    destination_zone = models.CharField(max_length=300, null=True)
    inbound_interface = models.CharField(max_length=300, null=True)
    outbound_interface = models.CharField(max_length=300, null=True)
    log_action = models.CharField(max_length=300, null=True)
    repeat_count = models.IntegerField(null=True)
    source_port = models.IntegerField(null=True)
    destination_port = models.IntegerField(null=True)
    nat_source_port = models.IntegerField(null=True)
    nat_destination_port = models.IntegerField(null=True)
    flags = models.CharField(max_length=300, null=True)
    protocol = models.CharField(max_length=300, null=True)
    action = models.CharField(max_length=300, null=True)
    url_filename = models.CharField(max_length=300, null=True)
    threat_content_name = models.CharField(max_length=300, null=True)
    category = models.CharField(max_length=300, null=True)
    severity = models.CharField(max_length=300, null=True)
    direction = models.CharField(max_length=300, null=True)
    sequence_number = models.CharField(max_length=300, null=True)
    action_flags = models.CharField(max_length=300, null=True)
    source_country = models.CharField(max_length=300, null=True)
    destination_country = models.CharField(max_length=300, null=True)
    cpadding = models.CharField(max_length=300, null=True)
    contenttype = models.CharField(max_length=300, null=True)
    url_idx = models.CharField(max_length=300, null=True)
    device_name = models.CharField(max_length=300, null=True)
    file_url = models.CharField(max_length=300, null=True)
    thr_category = models.CharField(max_length=300, null=True)
    contentver = models.CharField(max_length=300, null=True)
    sig_flags = models.CharField(max_length=300, null=True)

    class Meta:
        db_table = 'fh_prd_thrt_log_dtl_evnt_f'


class StageThreatLogDetailEvent(models.Model):
    threat_log = models.ForeignKey(
        ThreatLog, on_delete=models.CASCADE,
        related_name='stage_threat_log_traffic_log_id', null=True)
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE,
        related_name='stage_threat_log_firewall_rule_id', null=True)
    received_datetime = models.DateTimeField()
    log_type = models.CharField(max_length=300, null=True)
    threat_content_type = models.CharField(max_length=300, null=True)
    config_version = models.CharField(max_length=300, null=True)
    source_address = models.CharField(max_length=300, null=True)
    destination_address = models.CharField(max_length=300, null=True)
    nat_source_ip = models.CharField(max_length=300, null=True)
    nat_destination_ip = models.CharField(max_length=300, null=True)
    application = models.CharField(max_length=300, null=True)
    virtual_system = models.CharField(max_length=300, null=True)
    source_zone = models.CharField(max_length=300, null=True)
    destination_zone = models.CharField(max_length=300, null=True)
    inbound_interface = models.CharField(max_length=300, null=True)
    outbound_interface = models.CharField(max_length=300, null=True)
    log_action = models.CharField(max_length=300, null=True)
    repeat_count = models.IntegerField(null=True)
    source_port = models.IntegerField(null=True)
    destination_port = models.IntegerField(null=True)
    nat_source_port = models.IntegerField(null=True)
    nat_destination_port = models.IntegerField(null=True)
    flags = models.CharField(max_length=300, null=True)
    protocol = models.CharField(max_length=300, null=True)
    action = models.CharField(max_length=300, null=True)
    url_filename = models.CharField(max_length=300, null=True)
    threat_content_name = models.CharField(max_length=300, null=True)
    category = models.CharField(max_length=300, null=True)
    severity = models.CharField(max_length=300, null=True)
    direction = models.CharField(max_length=300, null=True)
    sequence_number = models.CharField(max_length=300, null=True)
    action_flags = models.CharField(max_length=300, null=True)
    source_country = models.CharField(max_length=300, null=True)
    destination_country = models.CharField(max_length=300, null=True)
    cpadding = models.CharField(max_length=300, null=True)
    contenttype = models.CharField(max_length=300, null=True)
    url_idx = models.CharField(max_length=300, null=True)
    device_name = models.CharField(max_length=300, null=True)
    file_url = models.CharField(max_length=300, null=True)
    thr_category = models.CharField(max_length=300, null=True)
    contentver = models.CharField(max_length=300, null=True)
    sig_flags = models.CharField(max_length=300, null=True)

    class Meta:
        db_table = 'fh_stg_thrt_log_dtl_evnt_f'


class StageApplicationChart(BaseChart):
    class Meta:
        db_table = 'fh_stg_trfc_chrt_app_dt_hr_a'
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    logged_datetime = models.DateTimeField()
    application = models.ForeignKey(Application, on_delete=models.CASCADE)


class StageRequestOriginChart(BaseFilteredChart):
    class Meta:
        db_table = 'fh_stg_trfc_chrt_req_org_dt_hr_a'
    country_name = models.CharField(max_length=100)
    country_code = models.CharField(max_length=10)


class StageTimeSeriesChart(BaseFilteredChart):
    class Meta:
        db_table = 'fh_stg_trfc_chrt_tm_srs_dt_hr_a'
    logged_datetime = models.DateTimeField()


class StageIPChart(BaseFilteredChart):
    class Meta:
        db_table = 'fh_stg_trfc_chrt_ip_dt_hr_a'
    logged_datetime = models.DateTimeField()
    address = models.CharField(max_length=15)


class StageSankeyChart(BaseFilteredChart):
    class Meta:
        db_table = 'fh_stg_trfc_chrt_con_dt_hr_a'
    logged_datetime = models.DateTimeField()
    source_address = models.CharField(max_length=15)
    destination_address = models.CharField(max_length=15)


class Bookmark(models.Model):
    datetime = models.DateTimeField(auto_now_add=True)
    log_name = models.CharField(max_length=500)
    bookmark = models.CharField(max_length=50, default="none")

    class Meta:
        db_table = 'fh_bookmark'
