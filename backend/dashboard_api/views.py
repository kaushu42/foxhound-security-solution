from collections import defaultdict

from django.db.models import Sum, F, Max, Count

from rest_framework.views import APIView
from rest_framework.response import Response

from globalutils.utils import (
    get_filter_ids_from_request,
    get_objects_with_date_filtered,
    set_null_items_to_zero,
    get_firewall_rules_id_from_request,
    get_country_name_and_code
)


from core.models import (
    Filter,
    FirewallRule,
    TimeSeriesChart,
    Application,
    Zone,
    Protocol,
    ApplicationChart,
    IPChart,
    
    TrafficLogDetailHourly,
    TrafficLogDetailHourly
)

from mis.models import (
    TrafficMisNewSourceIPDaily,
    TrafficMisNewDestinationIPDaily
)

from rules.models import TrafficRule

from serializers.serializers import (
    TimeSeriesChartSerializer,
    ApplicationChartSerializer
)


class StatsApiView(APIView):
    def post(self, request):
        filter_ids, firewall_rule_ids = get_filter_ids_from_request(
            request, return_firewall_ids=True
        )

        response = set_null_items_to_zero(
            get_objects_with_date_filtered(
                request, TimeSeriesChart,
                'logged_datetime',
                filter__in=filter_ids,
            )
            .aggregate(
                bytes_sent=Sum('sum_bytes_sent'),
                bytes_received=Sum('sum_bytes_received'),
                count=Sum('count_events')
            )
        )
        response['new_source_ip'] = get_objects_with_date_filtered(
            request,
            TrafficMisNewSourceIPDaily,
            'logged_datetime',
            firewall_rule__in=firewall_rule_ids
        ).count()
        response['new_destination_ip'] = get_objects_with_date_filtered(
            request,
            TrafficMisNewDestinationIPDaily,
            'logged_datetime',
            firewall_rule__in=firewall_rule_ids
        ).count()
        response['new_rules'] = get_objects_with_date_filtered(
            request,
            TrafficRule,
            'created_date_time',
            firewall_rule__in=firewall_rule_ids
        ).count()

        return Response(
            response
        )


class FiltersApiView(APIView):
    def _get_objs(self, objects, field_name):
        name = f'{field_name}__name'
        return objects.values_list(
            field_name,
            name,
        ).distinct().order_by(name)

    def post(self, request):
        filter_ids = get_filter_ids_from_request(
            request,
            apply_filters=False
        )
        objects = Filter.objects.filter(id__in=filter_ids)

        firewall_rule = self._get_objs(objects, 'firewall_rule')
        application = self._get_objs(objects, 'application')
        protocol = self._get_objs(objects, 'protocol')
        source_zone = self._get_objs(objects, 'source_zone')
        destination_zone = self._get_objs(objects, 'destination_zone')

        response = {
            "firewall_rule": firewall_rule,
            "application": application,
            "protocol": protocol,
            "source_zone": source_zone,
            "destination_zone": destination_zone
        }
        return Response(response)


class UsageApiView(APIView):
    def post(self, request, format=None):
        filter_ids = get_filter_ids_from_request(request)
        basis = request.data.get('basis', 'bytes')

        objects = get_objects_with_date_filtered(
            request,
            TimeSeriesChart,
            'logged_datetime',
            filter__in=filter_ids,
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


class ApplicationApiView(APIView):
    def post(self, request, format=None):
        top_count = int(request.data.get('topcount', 5))
        basis = request.data.get('basis', 'bytes')
        country = request.data.get('country', '')

        # Send all applications if top_count is 0
        # Assuming applications < 10000
        top_count = top_count if top_count else 10000

        firewall_rule_ids = get_firewall_rules_id_from_request(request)

        kwargs = {
            'firewall_rule__in': firewall_rule_ids,
        }
        if country:
            kwargs['source_country'] = country

        objects = get_objects_with_date_filtered(
            request,
            TrafficLogDetailHourly,
            'logged_datetime',
            **kwargs
        ).values(
            'logged_datetime',
            'application'
        ).annotate(
            bytes=Sum('sum_bytes_sent')+Sum('sum_bytes_received'),
            packets=Sum('sum_packets_sent')+Sum('sum_packets_received'),
            count=Count('firewall_rule_id'),
        ).values(
            'bytes',
            'packets',
            'count',
            date=F('logged_datetime'),
            application_name=F('application'),
        )

        applications = []
        max = 0

        # To store the top applications
        data = defaultdict(int)

        # To store the data for each application
        temp = defaultdict(list)

        for obj in objects:
            data[obj['application_name']] += obj['bytes']
            timestamp = obj['date'].timestamp()
            value = obj[basis]

            # Data is sent in TBPC order
            temp[obj['application_name']].append(
                [
                    timestamp,
                    value
                ]
            )
            max = value if value > max else max

        # Get the top n applications, sorted by bytes
        top_apps = sorted(data, key=data.get, reverse=True)[:top_count]

        # Only send data of the top n applications
        response = {i: temp[i] for i in top_apps}

        return Response({
            'data': response,
            'max': max
        })

    def get(self, request, format=None):
        return self.post(request, format=format)


class CountryApiView(APIView):
    def post(self, request, format=None):
        filter_ids = get_filter_ids_from_request(request)
        basis = request.data.get('basis', 'bytes')
        except_countries = request.data.get('except_countries', '')
        kwargs = {
            'filter__in': filter_ids
        }
        if except_countries:
            except_countries = except_countries.split(',')
        objects = get_objects_with_date_filtered(
            request,
            IPChart,
            'logged_datetime',
            **kwargs
        ).values('address').annotate(
            count=Sum('count_events'),
            bytes=Sum('sum_bytes_sent')+Sum('sum_bytes_received'),
            packets=Sum('sum_packets_sent')+Sum('sum_packets_received'),
        )

        values = defaultdict(int)

        for obj in objects:
            name, code = get_country_name_and_code(obj['address'])
            values[code] += obj[basis]
        return Response({
            i: values[i] for i in values if i not in except_countries
        })

    def get(self, request, format=None):
        return self.post(request, format=format)


class CountryListApiView(APIView):
    def post(self, request, format=None):
        filter_ids = get_filter_ids_from_request(request)
        objects = get_objects_with_date_filtered(
            request,
            IPChart,
            'logged_datetime',
            filter__in=filter_ids
        ).values('address').annotate(
            count=Count('address')
        )

        countries = set()
        for obj in objects:
            countries.add(get_country_name_and_code(obj['address']))
        return Response(countries)

    def get(self, request, format=None):
        return self.post(request, format=format)
