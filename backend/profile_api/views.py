from django.db.models.functions import TruncDay, TruncMonth
from django.db.models import Sum, Count

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
)

from core.models import TrafficLog, TrafficLogDetail
from globalutils import (
    get_month_day_index,
    groupby_date,
    get_activity,
    get_usage
)

from .utils import get_ip_from_request


class StatsApiView(APIView):
    def _get_stats(self, ip):
        objects = TrafficLogDetail.objects.filter(source_ip=ip)

        uplink = objects.aggregate(Sum('bytes_sent')).get(
            'bytes_sent__sum', None)
        downlink = objects.aggregate(Sum('bytes_received')).get(
            'bytes_received__sum', None)

        return {
            "uplink": uplink,
            "downlink": downlink,
        }

    def post(self, request, format=None):
        ip = get_ip_from_request(request)
        response = self._get_stats(ip)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class UsageApiView(APIView):
    def _get_usage(self, ip):
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

        return {
            "n_items": len(time),
            "time": time,
            "bytes_sent": bytes_sent,
            "bytes_received": bytes_received,
        }

    def post(self, request, format=None):
        ip = get_ip_from_request(request)
        response = self._get_usage(ip)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class ActivityApiView(APIView):
    def _get_activity(self, ip):
        objects = groupby_date(
            TrafficLogDetail.objects.filter(source_ip=ip),
            'logged_datetime',
            'day',
            ['bytes_sent', 'bytes_received']
        )

        activity_bytes_sent, activity_bytes_received = get_activity(objects)

        return {
            "n_items": len(activity_bytes_sent),
            "activity_bytes_sent": activity_bytes_sent,
            "activity_bytes_received": activity_bytes_received,
        }

    def post(self, request, format=None):
        ip = get_ip_from_request(request)
        response = self._get_activity(ip)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)
