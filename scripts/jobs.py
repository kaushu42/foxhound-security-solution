from django.db import models
from rules.models import TrafficRule

objects = TrafficRule.objects.filter(
    parent__isnull=True,
    is_generic=True
)
for obj in objects:
    src, dst, appl = obj.source_address, obj.destination_address, obj.application
    TrafficRule.objects.filter(
        Q(source_address__regex=src) &
        Q(destination_address__regex=src) &
        Q(application__regex=src),
        parent__isnull=True,
    ).update(parent=obj)


def clean(self):
    for rule in TrafficRule.name.like('%*%'):
        # Fully generic fields are stored as .* in db
        # So, we need to replace .* with %
        # Further if fields are not fully generic
        # We need to replace * with %
        source_ip = rule.source_ip.replace('.*', '%').replace('*', '%')
        destination_ip = rule.destination_ip.replace(
            '.*', '%').replace('*', '%')
        application = rule.application.replace('.*', '%').replace('*', '%')
        for i in BASE_QUERY.filter(
            Rule.id != rule.id,  # Do not get current item
            Rule.source_ip.like(source_ip),
            Rule.destination_ip.like(destination_ip),
            Rule.application.like(application)
        ):
            print(i, 'deleted!')
            session.delete(i)
        session.commit()
