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


# class IPDictionary(models.Model):
#     IP_PUBLIC_PRIVATE_CHOICES = (('Public', 'Public'), ('Private', 'Private'))

#     DEVICE_TYPE_CHOICES = (
#         ('Switch', 'Switch'),
#         ('Router', 'Router'),
#         ('ApplicationServer', 'ApplicationServer'),
#         ('DbServer', 'DbServer'),
#         ('EndUser', 'EndUser'),
#     )

#     virtual_system = models.ForeignKey(VirtualSystem, on_delete=models.CASCADE)
#     ip_address = models.CharField(max_length=50)
#     ip_name = models.CharField(max_length=150)
#     ip_public_private_type = models.CharField(
#         max_length=50, choices=IP_PUBLIC_PRIVATE_CHOICES)
#     device_type = models.CharField(max_length=50, choices=DEVICE_TYPE_CHOICES)
#     description = models.CharField(max_length=250)

#     def __repr__(self):
#         return f'{self.virtual_system, self.ip_address}'

#     def __str__(self):
#         return self.__repr__()


# class ProcessedLog(models.Model):
#     LOG_TYPE_CHOICES = (
#         ("Traffic", "Traffic"),
#         ("Threat", "Threat"),
#         ("URL Filtering", "URL Filtering"),
#         ("WildFire   Submission", "WildFire Submission"),
#         ("Data Filtering", "Data Filtering"),
#         ("Correlation", "Correlation"),
#         ("HIP Matching", "HIP Matching"),
#         ("System", "System"),
#         ("Alarms", "Alarms"),
#         ("Unified", "Unified"),
#     )
#     log_type = models.CharField(max_length=50,
#                                 choices=LOG_TYPE_CHOICES,
#                                 default=LOG_TYPE_CHOICES[0])
#     log_name = models.CharField(max_length=250)
#     log_date = models.DateField(auto_now_add=True)
#     log_process_date = models.DateTimeField(auto_now_add=True)

#     def __repr__(self):
#         return self.log_name

#     def __str__(self):
#         return self.__repr__()


class Log(models.Model):
    virtual_system = models.ForeignKey(
        VirtualSystem,
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
    ip_protocol = models.CharField(max_length=50)
    time_elapsed = models.BigIntegerField()
    date = models.DateField(auto_now_add=True)

    def __repr__(self):
        return f'Log-{self.virtual_system.code}-{self.date}'

    def __str__(self):
        return self.__repr__()
