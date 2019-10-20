from django.db.models import Sum

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
)

from .utils import is_ip_valid

from core.models import TrafficLogDetail


@api_view(['POST'])
def stats(request):
    ip = request.POST.get('ip', '')
    if not is_ip_valid(ip):
        return Response({"ip": ip}, status=HTTP_200_OK)

    objects = TrafficLogDetail.objects.filter(source_ip='192.168.114.3')
    uplink = objects.aggregate(Sum('bytes_sent')).get('bytes_sent__sum', None)
    downlink = objects.aggregate(Sum('bytes_received')).get(
        'bytes_received__sum', None)
    return Response({
        "uplink": uplink,
        "downlink": downlink,
    }, status=HTTP_200_OK)
