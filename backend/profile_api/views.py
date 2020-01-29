import datetime
import time
import json
from collections import defaultdict, OrderedDict
import traceback

import ipaddress

from django.db.models import Sum, Max

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
    HTTP_422_UNPROCESSABLE_ENTITY
)

from core.models import (
    TrafficLog, TrafficLogDetailGranularHour,
    IPAddress, TenantIPAddressInfo,
    FirewallRule, IPChart
)
from globalutils import (
    get_month_day_index,
    groupby_date,
    get_activity,
    get_usage,
    get_objects_with_date_filtered,
    get_filter_ids_from_request,
    get_firewall_rules_id_from_request,
    get_max,
    str_to_date
)
from views.views import PaginatedView
from serializers.serializers import (
    IPAliasSerializer,
    IPAddressSerializer
)
from .utils import get_ip_from_request, get_filters


def get_ip_type(ip):
    if not ip:
        return None
    return "Private" if ipaddress.ip_address(ip).is_private else "Public"


class StatsApiView(APIView):
    def post(self, request, format=None):
        filter_ids, firewall_rule_ids = get_filter_ids_from_request(
            request, return_firewall_ids=True
        )
        ip = get_ip_from_request(request)
        objects = get_objects_with_date_filtered(
            request,
            IPChart,
            'logged_datetime',
            filter__in=filter_ids,
            address=ip
        ).aggregate(
            uplink=Sum('bytes_sent'),
            downlink=Sum('bytes_received'),
        )
        try:
            alias = IPAddress.objects.get(address=ip).alias
        except Exception as e:
            print(e)
            alias = None
        response = {
            **objects,
            'alias': alias,
            'ip_type': get_ip_type(ip),
            'address': ip
        }
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class UsageApiView(APIView):
    def post(self, request, format=None):
        filter_ids = get_filter_ids_from_request(request)
        basis = request.data.get('basis', 'bytes')
        ip = get_ip_from_request(request)

        objects = get_objects_with_date_filtered(
            request,
            IPChart,
            'logged_datetime',
            filter__in=filter_ids,
            address=ip
        ).values('logged_datetime').annotate(
            bytes=Sum('bytes_sent') + Sum('bytes_received'),
            packets=Sum('packets_sent') + Sum('packets_received'),
            count=Sum('count')
        )

        data = []

        for obj in objects:
            data.append([obj['logged_datetime'].timestamp(), obj[basis]])

        max = objects.aggregate(
            max=Max(basis),
        )

        return Response({
            'data': data,
            'max': max['max']
        })

    def get(self, request, format=None):
        return self.post(request, format=format)


class AverageDailyApiView(APIView):
    def _get_total_avg(self, objects, basis):
        if basis == 'count':
            fields = ['count']
        else:
            fields = [f'{basis}_sent', f'{basis}_received']
        n_days = objects.distinct('logged_datetime').values('logged_datetime')
        n_days = n_days.count()//24
        data = groupby_date(
            objects,
            'logged_datetime',
            'hour',
            fields,
            Sum
        )
        total_avg = defaultdict(int)
        for d in data:
            hour = d['date'].hour
            if basis == 'count':
                total_avg[hour] += (d['count'])/n_days
            else:
                total_avg[hour] += (d[fields[0]] + d[fields[1]])/n_days
        return total_avg

    def _get_date_usage(self, objects, basis, date):
        latest_date = objects.latest('logged_datetime').logged_datetime
        if date is None:
            date = latest_date.replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )
        else:
            date = str_to_date(date)
        latest_data = objects.filter(logged_datetime__range=(
            date, date + datetime.timedelta(days=1))
        )

        response = defaultdict(int)
        for data in latest_data:
            # print(data.logged_datetime)
            if basis == 'count':
                sum_value = data.count
            else:
                sum_value = getattr(
                    data, f'{basis}_sent'
                ) + getattr(
                    data, f'{basis}_received'
                )
            response[data.logged_datetime.hour] += sum_value
        return response

    def _get_usage(self, ip, objects, basis, date):
        average = self._get_total_avg(objects, basis)
        daily = self._get_date_usage(objects, basis, date)
        return {
            'average': average,
            'daily': daily
        }

    def post(self, request, format=None):
        filter_ids = get_filter_ids_from_request(request)
        basis = request.data.get('basis', 'bytes')
        ip = get_ip_from_request(request)
        date = request.data.get('date')
        objects = IPChart.objects.filter(
            filter__in=filter_ids,
            address=ip
        )

        response = self._get_usage(ip, objects, basis, date)
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
        ).values('destination_ip__address').annotate(
            sent=Sum('bytes_sent')
        )
        ip_as_destination = objects.filter(
            destination_ip__address=ip,
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
            latest_date = TrafficLogDetailGranularHour.objects.latest(
                'logged_datetime'
            ).logged_datetime.date()
            latest_date = datetime.datetime.combine(
                latest_date, datetime.time())

            objects = groupby_date(
                TrafficLogDetailGranularHour.objects.filter(
                    logged_datetime__gte=latest_date,
                    source_ip__address=ip,
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
                objects.filter(source_ip__address=ip),
                'logged_datetime',
                'hour',
                ['bytes_sent', 'bytes_received']
            )
        (bytes_sent, bytes_received, bytes_sent_max,
         bytes_received_max) = get_usage(objects)

        return Response({
            "bytes_sent": bytes_sent,
            "bytes_received": bytes_received,
            "bytes_sent_max": bytes_sent_max,
            "bytes_received_max": bytes_received_max,
        }, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class GetIPAliasApiView(PaginatedView):
    serializer_class = IPAddressSerializer

    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = IPAddress.objects.all()
        page = self.paginate_queryset(objects.order_by('address'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)


class SetIPAliasApiView(APIView):
    def post(self, request):
        serializer = IPAliasSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors)

        tenant_id = get_tenant_id_from_token(request)
        ip = serializer.data['ip']
        alias = serializer.data['alias']
        try:
            item = IPAddress.objects.get(address=ip)
            item.alias = alias
            item.save()
        except Exception as e:
            IPAddress(address=ip, alias=alias).save()

        return Response({
            'saved': True
        })

    def get(self, request):
        ip = request.data.get('ip', None)
        if ip is None:
            return Response({
                "error": "Please enter an ip"
            }, status=HTTP_400_BAD_REQUEST)
        tenant_id = get_tenant_id_from_token(request)
        try:
            item = TenantIPAddressInfo.objects.filter(
                address=ip, firewall_rule__tenant__id=tenant_id)[0]
        except Exception as e:
            return Response({
                "traceback": str(traceback.format_exc()),
                "exception": str(e)
            }, status=HTTP_400_BAD_REQUEST)
        return Response({
            "address": item.address,
            "alias": item.alias
        })


class IPUsageByDateApiView(APIView):
    def post(self, request):
        tenant_id = get_tenant_id_from_token(request)
        ip = request.data.get('ip', None)
        if ip is None:
            return Response({
                "error": "'ip' required"
            }, status=HTTP_400_BAD_REQUEST)
        firewall_rules = FirewallRule.objects.filter(tenant__id=tenant_id)
        start_date = request.data.get(
            'date', None)
        if (start_date is None) or (start_date == 'undefined'):
            latest_date = TrafficLogDetailGranularHour.objects.latest(
                'logged_datetime'
            ).logged_datetime.date()
            end_date = latest_date + datetime.timedelta(days=1)
            # latest_date = datetime.datetime.combine(
            #     latest_date, datetime.time())
            objects = groupby_date(
                TrafficLogDetailGranularHour.objects.filter(
                    logged_datetime__range=(latest_date, end_date),
                    source_ip__address=ip,
                    firewall_rule__in=firewall_rules
                ),
                'logged_datetime',
                'hour',
                ['bytes_received']
            )
        else:
            end_date = str_to_date(start_date) + datetime.timedelta(days=1)

            objects = groupby_date(
                TrafficLogDetailGranularHour.objects.filter(
                    logged_datetime__range=(start_date, end_date),
                    source_ip__address=ip,
                    firewall_rule__in=firewall_rules
                ),
                'logged_datetime',
                'hour',
                ['bytes_received']
            )
        data = []
        max = 0
        for log in objects:
            time = log['date'].timestamp()
            bytes_received = log['bytes_received']
            max = max if max > bytes_received else bytes_received
            item = [time, bytes_received]
            data.append(item)
        return Response({
            "bytes_received": data,
            "bytes_received_max": max
        })
