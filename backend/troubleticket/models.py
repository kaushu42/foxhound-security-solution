from django.db import models

from users.models import FoxhoundUser
from core.models import TrafficLog, Tenant, FirewallRule
from rules.models import TrafficRule


class TroubleTicket(models.Model):
    class Meta:
        abstract = True

    created_datetime = models.DateTimeField(auto_now_add=True)
    is_closed = models.BooleanField(default=False)


class TroubleTicketFollowUp(models.Model):
    class Meta:
        abstract = True

    follow_up_datetime = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        related_name='assigned_by', null=True
    )
    assigned_to = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        related_name='assigned_to', null=True
    )
    description = models.CharField(max_length=1000)

    def __str__(self):
        return f'Follow-up-{self.id}'

    def __repr__(self):
        return self.__str__()


class TroubleTicketGroupAnomaly(TroubleTicket):
    class Meta:
        db_table = 'fh_prd_tt_anmly_grp_f'
    log = models.ForeignKey(
        TrafficLog, on_delete=models.CASCADE, null=True,
        related_name='grp_log'
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True,
        related_name='grp_frwl_rule')

    assigned_to = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        null=True, related_name='grp_assg_to'
    )
    description = models.CharField(max_length=500, null=True)
    repeat_count = models.PositiveIntegerField(null=True)
    time_elapsed = models.BigIntegerField(null=True)
    reasons = models.CharField(max_length=500, null=True)
    logged_datetime = models.DateTimeField(null=True)
    threat_content_type = models.CharField(max_length=50, null=True)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    nat_source_ip = models.CharField(max_length=50, null=True)
    nat_destination_ip = models.CharField(max_length=50, null=True)
    destination_port = models.PositiveIntegerField(null=True)
    source_port = models.PositiveIntegerField(null=True)
    nat_destination_port = models.PositiveIntegerField(null=True)
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
    bytes_sent = models.BigIntegerField(null=True)
    bytes_received = models.BigIntegerField(null=True)
    packets_received = models.BigIntegerField(null=True)
    packets_sent = models.BigIntegerField(null=True)
    verified_datetime = models.DateTimeField(auto_now=True, null=True)
    verified_by = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE, null=True,
        related_name='grp_verified_by_tt')
    is_anomaly = models.BooleanField(null=True, default=None)
    severity_level = models.CharField(max_length=50, null=True)

    def __str__(self):
        return f'{self.log}'

    def __repr__(self):
        return self.__str__()


class TroubleTicketAnomaly(TroubleTicket):
    class Meta:
        db_table = 'fh_prd_tt_anmly_f'
    tt_group = models.ForeignKey(
        TroubleTicketGroupAnomaly,
        on_delete=models.CASCADE, null=True
    )
    log = models.ForeignKey(
        TrafficLog, on_delete=models.CASCADE, null=True
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True)

    assigned_to = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        null=True
    )
    description = models.CharField(max_length=500, null=True)
    repeat_count = models.PositiveIntegerField(null=True)
    time_elapsed = models.BigIntegerField(null=True)
    reasons = models.CharField(max_length=500, null=True)
    logged_datetime = models.DateTimeField(null=True)
    threat_content_type = models.CharField(max_length=50, null=True)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    nat_source_ip = models.CharField(max_length=50, null=True)
    nat_destination_ip = models.CharField(max_length=50, null=True)
    destination_port = models.PositiveIntegerField(null=True)
    source_port = models.PositiveIntegerField(null=True)
    nat_destination_port = models.PositiveIntegerField(null=True)
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
    bytes_sent = models.BigIntegerField(null=True)
    bytes_received = models.BigIntegerField(null=True)
    packets_received = models.BigIntegerField(null=True)
    packets_sent = models.BigIntegerField(null=True)
    verified_datetime = models.DateTimeField(auto_now=True, null=True)
    verified_by = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE, null=True,
        related_name='verified_by_tt')
    is_anomaly = models.BooleanField(null=True, default=None)
    severity_level = models.CharField(max_length=50, null=True)

    def __str__(self):
        return f'{self.log}'

    def __repr__(self):
        return self.__str__()


class TroubleTicketFollowUpAnomaly(TroubleTicketFollowUp):
    trouble_ticket = models.ForeignKey(
        TroubleTicketAnomaly, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f'Anomaly-{self.trouble_ticket}-followup-{self.id}'

    def __repr__(self):
        return self.__str__()


class TroubleTicketGroupFollowUpAnomaly(models.Model):
    follow_up_datetime = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        related_name='assigned_by_group', null=True
    )
    assigned_to = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        related_name='assigned_to_group', null=True
    )
    description = models.CharField(max_length=1000)
    trouble_ticket = models.ForeignKey(
        TroubleTicketGroupAnomaly, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f'Anomaly-{self.trouble_ticket}-followup-{self.id}'

    def __repr__(self):
        return self.__str__()


class StageTroubleTicketAnomaly(TroubleTicket):
    class Meta:
        db_table = 'fh_stg_tt_anmly_f'
    tt_group = models.ForeignKey(
        TroubleTicketGroupAnomaly,
        on_delete=models.CASCADE, null=True
    )
    log = models.ForeignKey(
        TrafficLog, on_delete=models.CASCADE, null=True
    )
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True)

    assigned_to = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        null=True
    )
    description = models.CharField(max_length=500, null=True)
    repeat_count = models.PositiveIntegerField(null=True)
    time_elapsed = models.BigIntegerField(null=True)
    reasons = models.CharField(max_length=500, null=True)
    logged_datetime = models.DateTimeField(null=True)
    threat_content_type = models.CharField(max_length=50, null=True)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    nat_source_ip = models.CharField(max_length=50, null=True)
    nat_destination_ip = models.CharField(max_length=50, null=True)
    destination_port = models.PositiveIntegerField(null=True)
    source_port = models.PositiveIntegerField(null=True)
    nat_destination_port = models.PositiveIntegerField(null=True)
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
    bytes_sent = models.BigIntegerField(null=True)
    bytes_received = models.BigIntegerField(null=True)
    packets_received = models.BigIntegerField(null=True)
    packets_sent = models.BigIntegerField(null=True)
    verified_datetime = models.DateTimeField(auto_now=True, null=True)
    verified_by = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE, null=True,
        related_name='verified_by_tt_stg')

    def __str__(self):
        return f'{self.log}'

    def __repr__(self):
        return self.__str__()
