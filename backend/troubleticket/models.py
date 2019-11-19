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
    row_number = models.IntegerField()
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f'{self.log}-{self.row_number}'

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
