from django.db import models

from users.models import FoxhoundUser


class TroubleTicketType(models.Model):
    name = models.CharField(max_length=50)

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
