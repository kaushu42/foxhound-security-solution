from django.db.models.functions import TruncDay, TruncMonth
from django.db.models import Sum, Count

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
)

from core.models import TrafficLog, TrafficLogDetail
from globalutils.utils import (
    get_month_day_index,
    groupby_date,
    get_activity,
    get_usage
)

from .utils import get_ip_from_request


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
def usage(request):
    ip = get_ip_from_request(request)
    latest_date = TrafficLog.objects.latest('log_date')
    objects = groupby_date(
        TrafficLogDetail.objects.filter(
            traffic_log=latest_date, source_ip=ip
        ),
        'logged_datetime',
        'minute',
        ['bytes_sent', 'bytes_received']
    )

    time, bytes_sent, bytes_received = get_usage(objects)

    return Response({
        "n_items": len(time),
        "time": time,
        "bytes_sent": bytes_sent,
        "bytes_received": bytes_received,
    }, status=HTTP_200_OK)


@api_view(['POST'])
def activity(request):
    ip = get_ip_from_request(request)
    objects = groupby_date(
        TrafficLogDetail.objects.filter(source_ip=ip),
        'logged_datetime',
        'day',
        ['bytes_sent', 'bytes_received']
    )

    activity_bytes_sent, activity_bytes_received = get_activity(objects)

    return Response({
        "n_items": len(activity_bytes_sent),
        "activity_bytes_sent": activity_bytes_sent,
        "activity_bytes_received": activity_bytes_received,

    }, status=HTTP_200_OK)
