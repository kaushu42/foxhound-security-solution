import itertools
import datetime

from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
)

from core.models import TrafficLog, TrafficLogDetail
from troubleticket.models import TroubleTicket
from globalutils.utils import (
    get_month_day_index,
    groupby_date,
    get_activity,
    get_usage
)

from .utils import get_objects_with_matching_filters


class StatsApiView(APIView):
    def get(self, request, format=None):
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
            }, status=HTTP_200_OK
        )

    def post(self, request, format=None):
        return self.get(request, format=format)


@api_view(['POST'])
def rules(request):
    pass


class FilterApiView(APIView):
    def get(self, request, format=None):
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

        return Response(response, status=HTTP_200_OK)

    def post(self, request, format=None):
        return self.get(request, format=format)


class UsageApiView(APIView):
    def get(self, request, format=None):
        latest_date = TrafficLog.objects.latest('log_date')
        objects = groupby_date(
            TrafficLogDetail.objects.filter(
                traffic_log=latest_date
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

    def post(self, request, format=None):
        return self.get(request, format=format)


class ActivityApiView(APIView):
    def get(request):
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
        return self.get(request, format=format)
