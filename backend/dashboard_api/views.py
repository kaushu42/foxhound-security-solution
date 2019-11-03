import itertools
import datetime
from collections import defaultdict
import json

from django.db.models import Sum, Count

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
    HTTP_500_INTERNAL_SERVER_ERROR
)

from core.models import TrafficLog, TrafficLogDetail, IPCountry
from troubleticket.models import TroubleTicket
from globalutils import (
    get_month_day_index,
    groupby_date,
    get_activity,
    get_usage,
    get_query_from_request,
    get_objects_from_query
)


class StatsApiView(APIView):
    def get(self, request, format=None):
        query = get_query_from_request(request)
        uplink_downlink = get_objects_from_query(query)
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
            }, status=HTTP_200_OK
        )

    def post(self, request, format=None):
        return self.get(request, format=format)


@api_view(['POST'])
def rules(request):
    pass


class FiltersApiView(APIView):
    def get(self, request, format=None):
        objects = TrafficLogDetail.objects.all()
        firewall_rule = [
            l[0] for l in list(
                objects.values_list(
                    'firewall_rule').distinct().order_by('firewall_rule')
            )
        ]
        application = [
            l[0] for l in list(
                objects.values_list(
                    'application').distinct().order_by('application')
            )
        ]
        protocol = [
            l[0] for l in list(
                objects.values_list('protocol').distinct().order_by('protocol')
            )
        ]
        source_zone = [
            l[0] for l in list(
                objects.values_list(
                    'source_zone').distinct().order_by('source_zone')
            )
        ]
        destination_zone = [
            l[0] for l in list(
                objects.values_list('destination_zone').distinct().order_by(
                    'destination_zone')
            )
        ]

        response = {
            "firewall_rule": firewall_rule,
            "application": application,
            "protocol": protocol,
            "source_zone": source_zone,
            "destination_zone": destination_zone
        }

        return Response(response, status=HTTP_200_OK)

    def post(self, request, format=None):
        return self.get(request, format=format)


class UsageApiView(APIView):
    def get(self, request, format=None):
        query = get_query_from_request(request)
        if not query:
            latest_date = TrafficLog.objects.latest('log_date')
            objects = groupby_date(
                TrafficLogDetail.objects.filter(
                    traffic_log__id=latest_date.id
                ),
                'logged_datetime',
                'minute',
                ['bytes_sent', 'bytes_received']
            )
        else:
            objects = get_objects_from_query(query)
            objects = groupby_date(
                objects,
                'logged_datetime',
                'minute',
                ['bytes_sent', 'bytes_received']
            )
        bytes_sent, bytes_received = get_usage(objects)

        return Response({
            "n_items": len(bytes_sent),
            "bytes_sent": bytes_sent,
            "bytes_received": bytes_received,
        }, status=HTTP_200_OK)

    def post(self, request, format=None):
        return self.get(request, format=format)


class ActivityApiView(APIView):
    def get(self, request):
        objects = groupby_date(
            TrafficLogDetail.objects,
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

    def post(self, request, format=None):
        return self.get(request)


class WorldMapApiView(APIView):
    def get(self, request):
        query = get_query_from_request(request)
        objects = get_objects_from_query(query)
        objects = objects.values(
            'source_ip'
        ).annotate(
            ip_count=Count('source_ip')
        )

        country_data = defaultdict(int)

        for obj in objects:
            ip = obj['source_ip']
            count = obj['ip_count']
            try:
                country = IPCountry.objects.get(ip=ip).country_iso_code
            except Exception:
                return Response({
                    "error": "Database Error"
                }, status=HTTP_500_INTERNAL_SERVER_ERROR)
            country_data[country] += count
        # Delete nepal data for now, because it overshadows all other countries
        del country_data['np']
        data = []
        for key, value in country_data.items():
            data.append([key, value])
        return Response({
            'data': data
        }, status=HTTP_200_OK)

    def post(self, request, format=None):
        return self.get(request)
