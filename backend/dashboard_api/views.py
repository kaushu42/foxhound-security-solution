from urllib.parse import urlparse
import itertools
import datetime
from collections import defaultdict
import json

from django.db import connection
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

from core.models import (
    TrafficLog, TrafficLogDetail,
    Country, Domain
)
from troubleticket.models import TroubleTicketAnomaly
from globalutils import (
    get_month_day_index,
    groupby_date,
    get_activity,
    get_usage,
    get_query_from_request,
    get_objects_from_query,
    get_tenant_id_from_token
)
from serializers.serializers import (
    FilterSerializer,
    DomainURLSerializer
)


class StatsApiView(APIView):
    def get(self, request, format=None):
        tenant_id = get_tenant_id_from_token(request)
        query = get_query_from_request(request)
        uplink_downlink = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id)
        uplink = uplink_downlink.aggregate(
            Sum('bytes_sent')).get('bytes_sent__sum', None)
        downlink = uplink_downlink.aggregate(
            Sum('bytes_received')).get('bytes_received__sum', None)
        opened_tt = TroubleTicketAnomaly.objects.filter(
            is_closed=False).count()
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
        tenant_id = get_tenant_id_from_token(request)
        objects = TrafficLogDetail.objects.filter(
            firewall_rule__tenant__id=tenant_id)
        import operator
        firewall_rule = sorted(list(
            objects.values_list(
                'firewall_rule',
                'firewall_rule__name'
            ).distinct()
        ), key=operator.itemgetter(1))
        application = sorted(list(
            objects.values_list(
                'application',
                'application__name'
            ).distinct()
        ), key=operator.itemgetter(1))
        protocol = sorted(list(
            objects.values_list(
                'protocol',
                'protocol__name'
            ).distinct()
        ), key=operator.itemgetter(1))
        source_zone = sorted(list(
            objects.values_list(
                'source_zone',
                'source_zone__name'
            ).distinct()
        ), key=operator.itemgetter(1))
        destination_zone = sorted(list(
            objects.values_list(
                'destination_zone',
                'destination_zone__name'
            ).distinct()
        ), key=operator.itemgetter(1))

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
        tenant_id = get_tenant_id_from_token(request)
        query = get_query_from_request(request)
        filter_serializer = FilterSerializer(data=request.data)
        # if not filter_serializer.is_valid():
        #     return Response({"error": "filter error"})
        if not query:
            latest_date = TrafficLog.objects.latest('log_date')
            objects = groupby_date(
                TrafficLogDetail.objects.filter(
                    traffic_log__id=latest_date.id,
                    firewall_rule__tenant__id=tenant_id
                ),
                'logged_datetime',
                'hour',
                ['bytes_sent', 'bytes_received']
            )
        else:
            objects = get_objects_from_query(query).filter(
                firewall_rule__tenant__id=tenant_id)
            objects = groupby_date(
                objects,
                'logged_datetime',
                'hour',
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
        tenant_id = get_tenant_id_from_token(request)
        objects = groupby_date(
            TrafficLogDetail.objects.filter(
                firewall_rule__tenant__id=tenant_id),
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
        show_nepal = int(request.data.get('show_nepal', False))
        tenant_id = get_tenant_id_from_token(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id)
        objects = objects.values(
            'source_ip'
        ).annotate(
            ip_count=Count('source_ip')
        )
        country_data = defaultdict(int)
        import os
        import pandas as pd
        from sqlalchemy import create_engine
        db_name = os.environ.get('FH_DB_NAME', '')
        db_user = os.environ.get('FH_DB_USER', '')
        db_password = os.environ.get('FH_DB_PASSWORD', '')
        db_engine = create_engine(
            f'postgresql://{db_user}:{db_password}@localhost:5432/{db_name}'
        )
        objects = objects[:]
        objects = pd.DataFrame(objects)
        objects.columns = ['ip_address_id', 'count']
        countries = pd.read_sql('core_country', db_engine, index_col='id')
        data = objects.merge(countries, on='ip_address_id', how='inner')[
            ['iso_code', 'count']]
        data = data.groupby('iso_code').sum().to_dict(orient='split')
        response = []
        for i, j in zip(data['index'], data['data']):
            if (not show_nepal) and (i == 'np'):
                continue
            response.append([i, j[0]])
        return Response({
            'data': response
        }, status=HTTP_200_OK)

    def post(self, request, format=None):
        return self.get(request)


class IPAddressApiView(APIView):
    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id)
        data = objects.values('source_ip__id', 'source_ip__address',
                              'source_ip__alias').distinct('source_ip__address')
        return Response(data)
