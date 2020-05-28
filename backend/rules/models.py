from django.db import models
from users.models import FoxhoundUser
from core.models import FirewallRule, TenantIPAddressInfo
import architect

###### PROD TABLE #################################################################################################
@architect.install(
    'partition', type='range',
    subtype='date', constraint='day',
    column='created_date_time'
)
class TrafficRule(models.Model):
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, default=None)
    created_date_time = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=250)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    application = models.CharField(max_length=50, null=True)
    description = models.CharField(max_length=250, null=True, blank=True)
    is_verified_rule = models.BooleanField(default=False)
    is_anomalous_rule = models.BooleanField(default=False)
    verified_by_user = models.ForeignKey(
        FoxhoundUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    verified_date_time = models.DateTimeField(auto_now=True, null=True)
    is_generic = models.BooleanField(default=False, null=True)

    class Meta:
        db_table = 'fh_prd_trfc_rule_f'


###### STAGE TABLE #################################################################################################
class StageTrafficRule(models.Model):
    firewall_rule = models.ForeignKey(
        FirewallRule, on_delete=models.CASCADE, null=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, default=None)
    created_date_time = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=250)
    source_address = models.CharField(max_length=50, null=True)
    destination_address = models.CharField(max_length=50, null=True)
    application = models.CharField(max_length=50, null=True)
    description = models.CharField(max_length=250, null=True, blank=True)
    is_verified_rule = models.BooleanField(default=False)
    is_anomalous_rule = models.BooleanField(default=False)
    verified_by_user = models.ForeignKey(
        FoxhoundUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    verified_date_time = models.DateTimeField(auto_now=True, null=True)
    is_generic = models.BooleanField(default=False, null=True)
    class Meta:
        db_table = 'fh_stg_trfc_rule_f'
