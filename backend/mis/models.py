from django.db import models
from core.models import FirewallRule


class MISDailyIP(models.Model):
    date = models.DateField(null=True)
    address = models.CharField(max_length=250)
    tenant_id = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)

    def __str__(self):
        return self.address

    def __repr__(self):
        return self.address

    class Meta:
        abstract = True


class MISDailySourceIP(MISDailyIP):
    pass


class MISDailyDestinationIP(MISDailyIP):
    pass


class MISDailyApplication(models.Model):
    date = models.DateField(null=True)
    name = models.CharField(max_length=250)
    tenant_id = models.ForeignKey(FirewallRule, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name
