from django.db.models import Sum

from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import TrafficLogDetail
from troubleticket.models import TroubleTicket

from .utils import get_objects_with_matching_filters


@api_view(['POST'])
def stats(request):
    uplink_downlink = get_objects_with_matching_filters(request)
    uplink = uplink_downlink.aggregate(
        Sum('bytes_sent')).get('bytes_sent__sum', None)
    downlink = uplink_downlink.aggregate(
        Sum('bytes_received')).get('bytes_received__sum', None)
    opened_tt = TroubleTicket.objects.filter(is_closed=False).count()
    new_rules = None

    return Response(
        {
            "uplink": uplink,
            "downlink": downlink,
            "opened_tt": opened_tt,
            "new_rules": new_rules
        }
    )


@api_view(['POST'])
def rules(request):
    pass


@api_view(['POST'])
def filters(request):
    objects = TrafficLogDetail.objects.all()
    firewall_rule = [
        l[0] for l in list(
            objects.values_list('firewall_rule').distinct()
        )
    ]
    application = [
        l[0] for l in list(
            objects.values_list('application').distinct()
        )
    ]
    protocol = [
        l[0] for l in list(
            objects.values_list('protocol').distinct()
        )
    ]
    source_zone = [
        l[0] for l in list(
            objects.values_list('source_zone').distinct()
        )
    ]
    destination_zone = [
        l[0] for l in list(
            objects.values_list('destination_zone').distinct()
        )
    ]

    response = {
        "firewall_rule": firewall_rule,
        "application": application,
        "protocol": protocol,
        "source_zone": source_zone,
        "destination_zone": destination_zone
    }

    return Response(response)
