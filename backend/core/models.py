from django.db import models
from rest_framework import serializers


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
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class FirewallRule(models.Model):
    name = models.CharField(max_length=50)
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class Domain(models.Model):
    name = models.CharField(max_length=50
                            )
    url = models.CharField(max_length=250)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE,
                               null=True
                               )

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class TrafficLog(models.Model):
    processed_datetime = models.DateField(auto_now_add=True)
    log_date = models.DateField()
    log_name = models.CharField(max_length=200)

    def __repr__(self):
        return self.log_name

    def __str__(self):
        return self.__repr__()


class IPAddress(models.Model):
    address = models.CharField(max_length=15)
    type = models.BooleanField()

    def __str__(self):
        return self.address

    def __repr__(self):
        return self.address


class Application(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class Protocol(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name


class Zone(models.Model):
    name = models.CharField(max_length=50)
    type = models.BooleanField()

    def __str__(self):
        return f'{self.name}'

    def __repr__(self):
        return self.__str__()


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
        return f'{self.firewall_rule}:{self.source_zone}-{self.destination_zone}'

    def __repr__(self):
        return self.__str__()


class TrafficLogDetail(models.Model):
    traffic_log = models.ForeignKey(
        TrafficLog,
        on_delete=models.CASCADE, null=True
    )
    source_ip = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE, null=True,
        related_name='source_ip'
    )
    destination_ip = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE, null=True,
        related_name='destination_ip'
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
    row_number = models.BigIntegerField()
    source_port = models.PositiveIntegerField()
    destination_port = models.PositiveIntegerField()
    bytes_sent = models.BigIntegerField()
    bytes_received = models.BigIntegerField()
    repeat_count = models.PositiveIntegerField()
    packets_received = models.BigIntegerField()
    packets_sent = models.BigIntegerField()
    time_elapsed = models.BigIntegerField()
    logged_datetime = models.DateTimeField()

    def __repr__(self):
        return f'Log-{self.traffic_log}:{self.row_number}'

    def __str__(self):
        return self.__repr__()


class Country(models.Model):
    ip_address = models.ForeignKey(
        IPAddress, on_delete=models.CASCADE,
        null=True
    )
    name = models.CharField(max_length=50)
    iso_code = models.CharField(max_length=5)

    def __repr__(self):
        return f'{self.ip_address}-{self.iso_code}'

    def __str__(self):
        return self.__repr__()
