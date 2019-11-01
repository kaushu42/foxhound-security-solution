import json
from django.db.models.functions import TruncDay, TruncMonth, TruncHour
from django.db.models import Sum, Count, Avg

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
    HTTP_422_UNPROCESSABLE_ENTITY
)

from core.models import TrafficLog, TrafficLogDetail
from globalutils import (
    get_month_day_index,
    groupby_date,
    get_activity,
    get_usage,
    get_query_from_request,
    get_objects_from_query
)

from .utils import get_ip_from_request, get_filters


class StatsApiView(APIView):
    def _get_stats(self, ip, objects):
        objects = objects.filter(source_ip=ip)
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
        query = get_query_from_request(request)
        objects = get_objects_from_query(query)
        response = self._get_stats(ip, objects)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class AverageDailyApiView(APIView):
    def _get_usage(self, ip, objects):
        latest_date = TrafficLog.objects.latest('log_date')
        objects = groupby_date(
            objects.filter(
                traffic_log=latest_date, source_ip=ip
            ),
            'logged_datetime',
            'minute',
            ['bytes_sent', 'bytes_received'],
            Avg
        )
        time, bytes_sent, bytes_received = get_usage(objects)

        return {
            "n_items": len(bytes_sent),
            "x_axis": time,
            "bytes_sent": bytes_sent,
            "bytes_received": bytes_received,
        }

    def post(self, request, format=None):
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query)
        response = self._get_usage(ip, objects)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class ActivityApiView(APIView):
    def _get_activity(self, ip, objects):
        objs = groupby_date(
            objects.filter(source_ip=ip),
            'logged_datetime',
            'day',
            ['bytes_sent', 'bytes_received']
        )

        activity_bytes_sent, activity_bytes_received = get_activity(objs)

        return {
            "n_items": len(activity_bytes_sent),
            "activity_bytes_sent": activity_bytes_sent,
            "activity_bytes_received": activity_bytes_received,
        }

    def post(self, request, format=None):
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query)
        response = self._get_activity(ip, objects)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class SankeyApiView(APIView):
    def _get_destination_data(self, ip, ip_as_destination):
        ip_data = []
        for i in ip_as_destination:
            source = i['source_ip']
            weights = i['received']
            ip_data.append([source, ip, weights])
        return ip_data

    def _get_source_data(self, ip, ip_as_source):
        ip_data = []
        for i in ip_as_source:
            source = i['destination_ip']
            weights = i['sent']
            ip_data.append([ip, source, weights])
        return ip_data

    def _get_sankey(self, ip, objects):
        ip_as_source = objects.filter(
            source_ip=ip
        ).values('destination_ip').annotate(
            sent=Sum('bytes_sent')
        )
        ip_as_destination = objects.filter(
            destination_ip=ip
        ).values('source_ip').annotate(
            received=Sum('bytes_received')
        )
        destination_data = self._get_destination_data(ip, ip_as_destination)
        source_data = self._get_source_data(ip, ip_as_source)
        return {
            "ip_as_destination": destination_data,
            "ip_as_source": source_data,
        }

    def post(self, request, format=None):
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query)
        if ip is None:
            return Response({"error": "Invalid IP"},
                            status=HTTP_422_UNPROCESSABLE_ENTITY)
        response = self._get_sankey(ip, objects)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)
