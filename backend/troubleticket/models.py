from django.db import models

from users.models import FoxhoundUser
from core.models import TrafficLog, Tenant, FirewallRule
from rules.models import Rule


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


class TroubleTicketAnomaly(TroubleTicket):
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
    reasons = models.CharField(max_length=500, null=True)

    source_ip = models.CharField(max_length=25, null=True)
    destination_ip = models.CharField(max_length=25, null=True)
    source_zone = models.CharField(max_length=250, null=True)
    destination_zone = models.CharField(max_length=250, null=True)
    application = models.CharField(max_length=250, null=True)
    protocol = models.CharField(max_length=250, null=True)
    category = models.CharField(max_length=250, null=True)
    action = models.CharField(max_length=250, null=True)
    session_end_reason = models.CharField(max_length=250, null=True)
    bytes_sent = models.BigIntegerField(default=0)
    bytes_received = models.BigIntegerField(default=0)
    packets_sent = models.BigIntegerField(default=0)
    packets_received = models.BigIntegerField(default=0)
    source_port = models.IntegerField(default=0)
    destination_port = models.IntegerField(default=0)
    repeat_count = models.IntegerField(default=0)
    time_elapsed = models.IntegerField(default=0)
    logged_datetime = models.DateTimeField(auto_now=True)
    verified_datetime = models.DateTimeField(auto_now=True)
    verified_by = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE, null=True,
        related_name='verified_by_tt')

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


class TroubleTicketRule(TroubleTicket):
    rule = models.ForeignKey(
        Rule, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f'{self.rule}-TT'

    def __repr__(self):
        return self.__str__()


class TroubleTicketAnomalyTrafficLog(models.Model):
    row_number = models.BigIntegerField()
    log = models.ForeignKey(TrafficLog, on_delete=models.CASCADE, null=True)
    ticket = models.ForeignKey(
        TroubleTicketAnomaly, on_delete=models.CASCADE, null=True)
    # log_detail = models.ForeignKey(
    #     TrafficLogDetail, on_delete=models.CASCADE, null=True)
