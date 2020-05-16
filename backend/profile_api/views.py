from collections import defaultdict
import datetime
import ipaddress
import pytz
import time
import traceback

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
    TrafficLogDetailHourly,
    IPAddress, TenantIPAddressInfo,
    FirewallRule, IPChart,
    SankeyChart
)
from globalutils import (
    groupby_date,
    get_usage,
    get_objects_with_date_filtered,
    get_filter_ids_from_request,
    get_firewall_rules_id_from_request,
    str_to_date
)
from views.views import PaginatedView
from serializers.serializers import (
    IPAliasSerializer,
    IPAddressSerializer
)
from .utils import get_ip_from_request


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
            uplink=Sum('sum_bytes_sent'),
            downlink=Sum('sum_bytes_received'),
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
            bytes=Sum('sum_bytes_sent') + Sum('sum_bytes_received'),
            packets=Sum('sum_packets_sent') + Sum('sum_packets_received'),
            count=Sum('count_events')
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
            fields = ['count_events']
        else:
            fields = [f'sum_{basis}_sent', f'sum_{basis}_received']
        n_days = objects.distinct('logged_datetime').values('logged_datetime')
        n_days = n_days.count()//24
        if n_days == 0:
            n_days = 1
        data = groupby_date(
            objects,
            'logged_datetime',
            'hour',
            fields,
            Sum
        )
        total_avg = defaultdict(int)
        max = 0
        for d in data:
            hour = d['date'].hour
            if basis == 'count_events':
                sum = (d['count'])/n_days
            else:
                sum = (d[fields[0]] + d[fields[1]])/n_days
            total_avg[hour] += sum
            if max < sum:
                max = sum
        return total_avg, max

    def _get_date_usage(self, objects, basis, date):
        ktm_tz = pytz.timezone('Asia/Kathmandu')
        if date is None:
            latest_date = IPChart.objects.latest(
                'logged_datetime').logged_datetime.astimezone(ktm_tz)
            print(latest_date)
            date = latest_date.replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )
            print('date is none', date)
        else:
            date = str_to_date(date)
            print('date supplied', date)
        latest_data = objects.filter(logged_datetime__range=(
            date, date + datetime.timedelta(hours=23))
        )

        response = defaultdict(int)
        max = 0
        for data in latest_data:
            # print(data.logged_datetime)
            if basis == 'count_events':
                sum_value = data.count
            else:
                sum_value = getattr(
                    data, f'sum_{basis}_sent'
                ) + getattr(
                    data, f'sum_{basis}_received'
                )
            hour = data.logged_datetime.hour
            response[hour] += sum_value
            if max < sum_value:
                max = sum_value

        return response, max

    def _get_usage(self, ip, objects, basis, date):
        average, max = self._get_total_avg(objects, basis)
        daily, _ = self._get_date_usage(objects, basis, date)
        return {
            'average': average,
            'daily': daily,
            'max': max
        }

    def post(self, request, format=None):
        filter_ids = get_filter_ids_from_request(request)
        basis = request.data.get('basis', 'bytes')
        ip = get_ip_from_request(request)
        date = request.data.get('date')
        if not date:
            date = None
        objects = IPChart.objects.filter(
            filter__in=filter_ids,
            address=ip
        )

        response = self._get_usage(ip, objects, basis, date)
        return Response(response, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class SankeyApiView(APIView):
    def _get_kwargs_from_basis(self, basis):
        kwargs = {}
        if basis == 'count':
            kwargs = {
                'count': Sum('count_events')
            }
        else:
            kwargs = {
                basis: Sum(f'sum_{basis}_sent') + Sum(f'sum_{basis}_received')
            }
        return kwargs

    def _get_objects(self, request):
        filter_ids = get_filter_ids_from_request(request)
        basis = request.data.get('basis', 'bytes')
        ip = get_ip_from_request(request)
        kwargs = self._get_kwargs_from_basis(basis)
        as_source = get_objects_with_date_filtered(
            request,
            SankeyChart,
            'logged_datetime',
            filter__in=filter_ids,
            source_address=ip
        ).values('destination_address').annotate(**kwargs)
        as_destination = get_objects_with_date_filtered(
            request,
            SankeyChart,
            'logged_datetime',
            filter__in=filter_ids,
            destination_address=ip
        ).values('source_address').annotate(**kwargs)
        return as_source, as_destination, basis, ip

    def post(self, request, format=None):
        as_src, as_dest, basis, ip = self._get_objects(request)
        src_response = []
        dest_response = []

        for i in as_src:
            src_response.append([ip, i['destination_address'], i[basis]])
        for i in as_dest:
            dest_response.append([i['source_address'], ip, i[basis]])

        return Response({
            'src': src_response,
            'dest': dest_response
        }, status=HTTP_200_OK)

    def get(self, request, format=None):
        return self.post(request, format=format)


class TimeSeriesApiView(APIView):
    def post(self, request, format=None):
        tenant_id = get_tenant_id_from_token(request)
        ip = get_ip_from_request(request)
        query = get_query_from_request(request)

        if not query:
            latest_date = TrafficLogDetailHourly.objects.latest(
                'logged_datetime'
            ).logged_datetime.date()
            latest_date = datetime.datetime.combine(
                latest_date, datetime.time())

            objects = groupby_date(
                TrafficLogDetailHourly.objects.filter(
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
        objects = IPAddress.objects.filter(firewall_rule__in=firewall_ids)
        page = self.paginate_queryset(objects.order_by('address'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)


class SetIPAliasApiView(APIView):
    def post(self, request):
        serializer = IPAliasSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors)

        firewall_ids = get_firewall_rules_id_from_request(request)

        ip = serializer.data['ip']
        alias = serializer.data['alias']
        try:
            obj = IPAddress.objects.get(
                firewall_rule__in=firewall_ids,
                address=ip
            )
            obj.alias = alias
            obj.save()
        except IPAddress.DoesNotExist:
            IPAddress.objects.create(
                firewall_rule_id=next(iter(firewall_ids)),
                address=ip,
                alias=alias
            ).save()
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
            latest_date = TrafficLogDetailHourly.objects.latest(
                'logged_datetime'
            ).logged_datetime.date()
            end_date = latest_date + datetime.timedelta(days=1)
            # latest_date = datetime.datetime.combine(
            #     latest_date, datetime.time())
            objects = groupby_date(
                TrafficLogDetailHourly.objects.filter(
                    logged_datetime__range=(latest_date, end_date),
                    source_ip__address=ip,
                    firewall_rule__in=firewall_rules
                ),
                'logged_datetime',
                'hour',
                ['sum_bytes_received']
            )
        else:
            end_date = str_to_date(start_date) + datetime.timedelta(days=1)

            objects = groupby_date(
                TrafficLogDetailHourly.objects.filter(
                    logged_datetime__range=(start_date, end_date),
                    source_ip__address=ip,
                    firewall_rule__in=firewall_rules
                ),
                'logged_datetime',
                'hour',
                ['sum_bytes_received']
            )
        data = []
        max = 0
        for log in objects:
            time = log['date'].timestamp()
            bytes_received = log['sum_bytes_received']
            max = max if max > bytes_received else bytes_received
            item = [time, bytes_received]
            data.append(item)
        return Response({
            "bytes_received": data,
            "bytes_received_max": max
        })
