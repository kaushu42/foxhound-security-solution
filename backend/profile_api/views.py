import json
from collections import defaultdict, OrderedDict

import ipaddress

from django.db.models.functions import TruncDay, TruncMonth, TruncHour
from django.db.models import Sum, Count

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
    HTTP_422_UNPROCESSABLE_ENTITY
)

from core.models import (
    TrafficLog, TrafficLogDetail,
    IPAddress
)
from globalutils import (
    get_month_day_index,
    groupby_date,
    get_activity,
    get_usage,
    get_query_from_request,
    get_objects_from_query,
    get_tenant_id_from_token
)

from .utils import get_ip_from_request, get_filters


def get_ip_type(ip):
    if not ip:
        return None
    return "Private" if ipaddress.ip_address(ip).is_private else "Public"


class StatsApiView(APIView):
    def _get_stats(self, ip, objects):
        objects = objects.filter(
            source_ip__address=ip,
            source_ip__type=False
        )
        uplink = objects.aggregate(
            Sum('bytes_sent')).get(
                'bytes_sent__sum', None
        )

        downlink = objects.aggregate(
            Sum('bytes_received')).get(
            'bytes_received__sum', None
        )

        return {
            "uplink": uplink,
            "downlink": downlink,
            "ip_address": ip,
            "alias_name": ip,
            "ip_address_type": get_ip_type(ip)
        }

    def post(self, request, format=None):
        tenant_id = get_tenant_id_from_token(request)
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id
        )
        response = self._get_stats(ip, objects)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class AverageDailyApiView(APIView):
    def _get_usage(self, ip, objects):
        objects = objects.filter(
            source_ip__address=ip,
            source_ip__type=False,
        )
        as_source = groupby_date(
            objects,
            'logged_datetime',
            'hour',
            ['bytes_sent'],
            Sum
        )
        as_destination = groupby_date(
            objects,
            'logged_datetime',
            'hour',
            ['bytes_received'],
            Sum
        )
        n_days = len(as_destination)//24
        bytes_sent = defaultdict(int)
        bytes_received = defaultdict(int)
        for sent, received in zip(as_source, as_destination):
            time = str(sent['date'].time())
            bytes_sent[time] += sent['bytes_sent']/n_days
            bytes_received[time] += received['bytes_received']/n_days

        bytes_sent = OrderedDict(sorted(bytes_sent.items()))
        bytes_received = OrderedDict(sorted(bytes_received.items()))

        bytes_sent_data = []
        bytes_received_data = []
        assert len(bytes_sent) == len(bytes_received)
        for i, j in zip(bytes_sent, bytes_received):
            bytes_sent_data.append([i, bytes_sent[i]])
            bytes_received_data.append([j, bytes_received[j]])
        return {
            "bytes_sent": bytes_sent_data,
            "bytes_received": bytes_received_data,
        }

    def post(self, request, format=None):
        tenant_id = get_tenant_id_from_token(request)
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id
        )
        response = self._get_usage(ip, objects)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class ActivityApiView(APIView):
    def _get_activity(self, ip, objects):
        objs = groupby_date(
            objects.filter(source_ip__address=ip),
            'logged_datetime',
            'day',
            ['bytes_sent', 'bytes_received']
        )

        activity_bytes_sent, activity_bytes_received = get_activity(objs)

        return {
            "activity_bytes_sent": activity_bytes_sent,
            "activity_bytes_received": activity_bytes_received,
        }

    def post(self, request, format=None):
        tenant_id = get_tenant_id_from_token(request)
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id
        )
        response = self._get_activity(ip, objects)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class SankeyApiView(APIView):
    def _get_destination_data(self, ip, ip_as_destination):
        ip_data = []
        for i in ip_as_destination:
            source = i['source_ip__address']
            weights = i['received']
            ip_data.append([source, ip, weights])
        return ip_data

    def _get_source_data(self, ip, ip_as_source):
        ip_data = []
        for i in ip_as_source:
            source = i['destination_ip__address']
            weights = i['sent']
            ip_data.append([ip, source, weights])
        return ip_data

    def _get_sankey(self, ip, objects):
        ip_as_source = objects.filter(
            source_ip__address=ip,
            source_ip__type=False
        ).values('destination_ip__address').annotate(
            sent=Sum('bytes_sent')
        )
        ip_as_destination = objects.filter(
            destination_ip__address=ip,
            destination_ip__type=False
        ).values('source_ip__address').annotate(
            received=Sum('bytes_received')
        )
        destination_data = self._get_destination_data(ip, ip_as_destination)
        source_data = self._get_source_data(ip, ip_as_source)
        return {
            "ip_as_destination": destination_data,
            "ip_as_source": source_data,
        }

    def post(self, request, format=None):
        tenant_id = get_tenant_id_from_token(request)
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id
        )
        if ip is None:
            return Response({
                "ip_as_source": [],
                "ip_as_destination": []
            },
                status=HTTP_422_UNPROCESSABLE_ENTITY)
        response = self._get_sankey(ip, objects)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class TimeSeriesApiView(APIView):
    def post(self, request, format=None):
        tenant_id = get_tenant_id_from_token(request)
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)

        if not query:
            latest_date = TrafficLog.objects.latest('log_date')
            objects = groupby_date(
                TrafficLogDetail.objects.filter(
                    traffic_log__id=latest_date.id,
                    source_ip__address=ip,
                    source_ip__type=False,
                    firewall_rule__tenant__id=tenant_id
                ),
                'logged_datetime',
                'hour',
                ['bytes_sent', 'bytes_received']
            )
        else:
            objects = get_objects_from_query(query).filter(
                firewall_rule__tenant__id=tenant_id
            )
            objects = groupby_date(
                objects.filter(source_ip__address=ip,
                               source_ip__type=False),
                'logged_datetime',
                'hour',
                ['bytes_sent', 'bytes_received']
            )
        bytes_sent, bytes_received = get_usage(objects)

        return Response({
            "bytes_sent": bytes_sent,
            "bytes_received": bytes_received,
        }, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.get(request, format=format)
