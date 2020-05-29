from django.db import models
from django.db.models import Q
from rules.models import TrafficRule
from core.models import FirewallRule

objects = TrafficRule.objects.filter(
    parent__isnull=True,
    is_generic=True
)
for obj in objects:
    tenant_id = FirewallRule.objects.get(id=obj.firewall_rule.id).tenant.id
    src, dst, appl = obj.source_address, obj.destination_address, obj.application
    items = TrafficRule.objects.filter(
        ~Q(id=obj.id),
        source_address__regex=src,
        destination_address__regex=dst,
        application__regex=appl,
        parent__isnull=True,
        firewall_rule__tenant__id=tenant_id,
    )

    print(f'{items.count()} objects found')
    items.update(parent=obj)
