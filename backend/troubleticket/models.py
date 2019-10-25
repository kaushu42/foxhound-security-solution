from django.db import models

from users.models import FoxhoundUser
from core.models import TrafficLog


class TroubleTicketType(models.Model):
    ANOMALY_DETECTION = "AN"
    RULE_BASED = "RU"
    TROUBLE_TICKET_TYPE_CHOICES = [
        (ANOMALY_DETECTION, 'ANOMALY'),
        (RULE_BASED, 'RULE'),
    ]
    name = models.CharField(max_length=2,
                            choices=TROUBLE_TICKET_TYPE_CHOICES)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class TroubleTicket(models.Model):
    trouble_ticket_type = models.ForeignKey(
        TroubleTicketType, on_delete=models.CASCADE)
    created_datetime = models.DateTimeField(auto_now_add=True)
    created_by_user = models.ForeignKey(FoxhoundUser, on_delete=models.CASCADE)
    is_closed = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.trouble_ticket_type.name}-{self.created_datetime}'

    def __repr__(self):
        return self.__str__()


class TroubleTicketFollowUp(models.Model):
    trouble_ticket = models.ForeignKey(TroubleTicket, on_delete=models.CASCADE)
    follow_up_datetime = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE, related_name='assigned_by')
    assigned_to = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE, related_name='assigned_to')
    description = models.CharField(max_length=1000)

    def __str__(self):
        return f'{self.trouble_ticket}-{self.created_datetime}-followup'

    def __repr__(self):
        return self.__str__()


class TroubleTicketAnomaly(models.Model):
    created_datetime = models.DateTimeField(auto_now_add=True)
    is_closed = models.BooleanField(default=False)
    log = models.ForeignKey(TrafficLog, on_delete=models.CASCADE)
    log_record_number = models.IntegerField()
    ip_address = models.CharField(max_length=15)

    def __str__(self):
        return f'{self.log}-{self.log_record_number}-{self.created_datetime}'

    def __repr__(self):
        return self.__str__()


class TroubleTicketFollowUpAnomaly(models.Model):
    trouble_ticket = models.ForeignKey(
        TroubleTicketAnomaly, on_delete=models.CASCADE)
    follow_up_datetime = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        related_name='trouble_ticket_anomaly_assigned_by'
    )
    assigned_to = models.ForeignKey(
        FoxhoundUser, on_delete=models.CASCADE,
        related_name='trouble_ticket_anomaly_assigned_to'
    )
    description = models.CharField(max_length=1000)

    def __str__(self):
        return f'{self.trouble_ticket}-{self.created_datetime}-followup'

    def __repr__(self):
        return self.__str__()
