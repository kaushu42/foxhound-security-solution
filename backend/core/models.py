from users.models import FoxhoundUser as User
from django.db import models
from rest_framework import serializers


class VirtualSystem(models.Model):
    code = models.CharField(max_length=20, unique=True, null=False)
    name = models.CharField(max_length=100, unique=True, null=False)
    domain_url = models.CharField(max_length=250, default="localhost")
    domain_code = models.CharField(max_length=50)
    tenant_name = models.CharField(max_length=250, default="tenant")

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class RuleDictionary(models.Model):
    virtual_system = models.ForeignKey(VirtualSystem, on_delete=models.CASCADE)
    created_date_time = models.DateTimeField(auto_now_add=True)
    rule_name = models.CharField(max_length=250)
    source_ip = models.CharField(max_length=50)
    destination_ip = models.CharField(max_length=50)
    application = models.CharField(max_length=50)
    rule_description = models.CharField(max_length=250)
    is_verified_rule = models.BooleanField(default=False)
    verified_by_user = models.ForeignKey(User,
                                         on_delete=models.CASCADE,
                                         null=True,
                                         blank=True)
    verified_date_time = models.DateTimeField(auto_now=True)

    def __repr__(self):
        return self.rule_name

    def __str__(self):
        return self.__repr__()


class TrafficLog(models.Model):
    virtual_system = models.ForeignKey(
        VirtualSystem,
        on_delete=models.CASCADE,
    )
    processed_datetime = models.DateField(auto_now_add=True)
    log_date = models.DateField()
    log_name = models.CharField(max_length=200)

    def __repr__(self):
        return self.log_name

    def __str__(self):
        return self.__repr__()


class TrafficLogDetail(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE,
    )
    source_ip = models.CharField(max_length=50)
    source_port = models.PositiveIntegerField()
    destination_ip = models.CharField(max_length=50)
    destination_port = models.PositiveIntegerField()
    bytes_sent = models.BigIntegerField()
    bytes_received = models.BigIntegerField()
    repeat_count = models.PositiveIntegerField()
    application = models.CharField(max_length=50)
    packets_received = models.BigIntegerField()
    packets_sent = models.BigIntegerField()
    protocol = models.CharField(max_length=50)
    time_elapsed = models.BigIntegerField()
    source_zone = models.CharField(max_length=50)
    destination_zone = models.CharField(max_length=50)
    firewall_rule = models.CharField(max_length=50)

    def __repr__(self):
        return f'Log-{self.traffic_log.id}'

    def __str__(self):
        return self.__repr__()
