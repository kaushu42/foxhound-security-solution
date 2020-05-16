from django.db import models
from core.models import FirewallRule
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
class TrafficMisNewSourceIPDaily(DailyIP):
    source_address = models.CharField(max_length=250)
    avg_repeat_count = models.DecimalField(decimal_places=2, max_digits=10)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    class Meta:
        db_table = 'fh_prd_trfc_mis_new_src_ip_dy_a'

    def __str__(self):
        return self.source_address

    def __repr__(self):
        return self.source_address


class StageTrafficMisNewSourceIPDaily(DailyIP):
    source_address = models.CharField(max_length=250)
    avg_repeat_count = models.DecimalField(decimal_places=2, max_digits=10)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    class Meta:
        db_table = 'fh_stg_trfc_mis_new_src_ip_dy_a'

    def __str__(self):
        return self.source_address

    def __repr__(self):
        return self.source_address


@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='logged_datetime'
)
class TrafficMisNewDestinationIPDaily(DailyIP):
    destination_address = models.CharField(max_length=250)
    avg_repeat_count = models.DecimalField(decimal_places=2, max_digits=10)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    class Meta:
        db_table = 'fh_prd_trfc_mis_new_dst_ip_dy_a'

    def __str__(self):
        return self.destination_address

    def __repr__(self):
        return self.destination_address


class StageTrafficMisNewDestinationIPDaily(DailyIP):
    destination_address = models.CharField(max_length=250)
    avg_repeat_count = models.DecimalField(decimal_places=2, max_digits=10)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    class Meta:
        db_table = 'fh_stg_trfc_mis_new_dst_ip_dy_a'

    def __str__(self):
        return self.destination_address

    def __repr__(self):
        return self.destination_address


class TrafficMisNewApplicationDaily(models.Model):
    logged_datetime = models.DateField(null=True)
    processed_datetime = models.DateField(null=True)
    application = models.CharField(max_length=250)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    avg_repeat_count = models.DecimalField(decimal_places=2, max_digits=10)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    def __str__(self):
        return self.application

    def __repr__(self):
        return self.application

    class Meta:
        db_table = 'fh_prd_trfc_mis_new_app_dy_a'


class StageTrafficMisNewApplicationDaily(models.Model):
    logged_datetime = models.DateField(null=True)
    processed_datetime = models.DateField(null=True)
    application = models.CharField(max_length=250)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    avg_repeat_count = models.DecimalField(decimal_places=2, max_digits=10)
    sum_bytes_sent = models.BigIntegerField()
    sum_bytes_received = models.BigIntegerField()
    sum_packets_received = models.BigIntegerField()
    sum_packets_sent = models.BigIntegerField()
    sum_time_elapsed = models.BigIntegerField()
    count_events = models.BigIntegerField()

    def __str__(self):
        return self.application

    def __repr__(self):
        return self.application

    class Meta:
        db_table = 'fh_stg_trfc_mis_new_app_dy_a'


class TrafficMisRequestFromBlacklistedIPDaily(models.Model):
    logged_datetime = models.DateTimeField(null=True)
    processed_datetime = models.DateField(null=True)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    source_address = models.CharField(max_length=250, null=True)
    destination_address = models.CharField(max_length=250, null=True)
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=250, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    destination_port = models.PositiveIntegerField(null=True)
    avg_repeat_count = models.DecimalField(
        decimal_places=2, max_digits=10, default=0)
    sum_bytes_sent = models.BigIntegerField(default=0)
    sum_bytes_received = models.BigIntegerField(default=0)
    sum_packets_received = models.BigIntegerField(default=0)
    sum_packets_sent = models.BigIntegerField(default=0)
    sum_time_elapsed = models.BigIntegerField(default=0)
    count_events = models.BigIntegerField(default=0)

    class Meta:
        db_table = 'fh_prd_trfc_mis_req_frm_blip_dy_a'


class StageTrafficMisRequestFromBlacklistedIPDaily(models.Model):
    logged_datetime = models.DateTimeField(null=True)
    processed_datetime = models.DateField(null=True)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    source_address = models.CharField(max_length=250, null=True)
    destination_address = models.CharField(max_length=250, null=True)
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=250, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    destination_port = models.PositiveIntegerField(null=True)
    avg_repeat_count = models.DecimalField(
        decimal_places=2, max_digits=10, default=0)
    sum_bytes_sent = models.BigIntegerField(default=0)
    sum_bytes_received = models.BigIntegerField(default=0)
    sum_packets_received = models.BigIntegerField(default=0)
    sum_packets_sent = models.BigIntegerField(default=0)
    sum_time_elapsed = models.BigIntegerField(default=0)
    count_events = models.BigIntegerField(default=0)

    class Meta:
        db_table = 'fh_stg_trfc_mis_req_frm_blip_dy_a'


class TrafficMisResponseToBlacklistedIPDaily(models.Model):
    logged_datetime = models.DateTimeField(null=True)
    processed_datetime = models.DateField(null=True)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    source_address = models.CharField(max_length=250, null=True)
    destination_address = models.CharField(max_length=250, null=True)
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=250, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    destination_port = models.PositiveIntegerField(null=True)
    avg_repeat_count = models.DecimalField(
        decimal_places=2, max_digits=10, default=0)
    sum_bytes_sent = models.BigIntegerField(default=0)
    sum_bytes_received = models.BigIntegerField(default=0)
    sum_packets_received = models.BigIntegerField(default=0)
    sum_packets_sent = models.BigIntegerField(default=0)
    sum_time_elapsed = models.BigIntegerField(default=0)
    count_events = models.BigIntegerField(default=0)

    class Meta:
        db_table = 'fh_prd_trfc_mis_res_to_blip_dy_a'


class StageTrafficMisResponseToBlacklistedIPDaily(models.Model):
    logged_datetime = models.DateTimeField(null=True)
    processed_datetime = models.DateField(null=True)
    firewall_rule = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)
    source_address = models.CharField(max_length=250, null=True)
    destination_address = models.CharField(max_length=250, null=True)
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=250, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    inbound_interface = models.CharField(max_length=250, null=True)
    outbound_interface = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    destination_port = models.PositiveIntegerField(null=True)
    avg_repeat_count = models.DecimalField(
        decimal_places=2, max_digits=10, default=0)
    sum_bytes_sent = models.BigIntegerField(default=0)
    sum_bytes_received = models.BigIntegerField(default=0)
    sum_packets_received = models.BigIntegerField(default=0)
    sum_packets_sent = models.BigIntegerField(default=0)
    sum_time_elapsed = models.BigIntegerField(default=0)
    count_events = models.BigIntegerField(default=0)

    class Meta:
        db_table = 'fh_stg_trfc_mis_res_to_blip_dy_a'


class TrafficMisDaily(models.Model):
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

    class Meta:
        db_table = 'fh_prd_trfc_mis_dy_a'


class StageTrafficMisDaily(models.Model):
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

    class Meta:
        db_table = 'fh_stg_trfc_mis_dy_a'
