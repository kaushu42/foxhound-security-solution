from django.db.models import Sum

from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import Log

from .utils import get_objects_with_matching_filters


@api_view(['POST'])
def summary(request):
    objects = get_objects_with_matching_filters(request)
    uplink = objects.aggregate(
        Sum('bytes_sent')).get('bytes_sent__sum', None)
    downlink = objects.aggregate(
        Sum('bytes_received')).get('bytes_received__sum', None)
    opened_tt = None
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
