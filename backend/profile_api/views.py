from django.db.models.functions import TruncDay, TruncMonth
from django.db.models import Sum, Count

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
)

from .utils import get_ip_from_request, get_month_day_index

from core.models import TrafficLogDetail


@api_view(['POST'])
def stats(request):
    ip = get_ip_from_request(request)
    objects = TrafficLogDetail.objects.filter(source_ip=ip)
    uplink = objects.aggregate(Sum('bytes_sent')).get('bytes_sent__sum', None)
    downlink = objects.aggregate(Sum('bytes_received')).get(
        'bytes_received__sum', None)
    return Response({
        "uplink": uplink,
        "downlink": downlink,
    }, status=HTTP_200_OK)


@api_view(['POST'])
def activity(request):
    ip = get_ip_from_request(request)
    objects = TrafficLogDetail.objects.filter(source_ip=ip).annotate(
        day=TruncDay(
            'logged_datetime'
        )
    ).values(
        'day'
    ).annotate(
        bytes_sent=Sum('bytes_sent'),
        bytes_received=Sum('bytes_received'),
    ).values('day', 'bytes_sent', 'bytes_received')

    activity_bytes_sent = []
    activity_bytes_received = []
    for obj in objects:
        bytes_sent = obj['bytes_sent']
        bytes_received = obj['bytes_received']

        month, day = get_month_day_index(obj['day'])
        activity_bytes_sent.append([month, day, bytes_sent])
        activity_bytes_received.append([month, day, bytes_received])
    return Response({
        "activity_bytes_sent": activity_bytes_sent,
        "activity_bytes_received": activity_bytes_received,
        "n_items": len(activity_bytes_sent)
    })
