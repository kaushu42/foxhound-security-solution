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
    IPChart
)

from serializers.serializers import (
    TimeSeriesChartSerializer,
    ApplicationChartSerializer
)


class StatsApiView(APIView):
    def post(self, request):
        filter_ids = get_filter_ids_from_request(request)

        response = set_null_items_to_zero(
            get_objects_with_date_filtered(
                request, TimeSeriesChart,
                'logged_datetime',
                filter__in=filter_ids,
            )
            .aggregate(
                bytes_sent=Sum('bytes_sent'),
                bytes_received=Sum('bytes_received')
            )
        )

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
        objects = get_objects_with_date_filtered(
            request,
            TimeSeriesChart,
            'logged_datetime',
            filter__in=filter_ids,
        ).values('logged_datetime').annotate(
            bytes=Sum('bytes_sent') + Sum('bytes_received'))
        serializer = TimeSeriesChartSerializer(objects, many=True)
        max_bytes = objects.aggregate(Max('bytes'))

        return Response({
            'data': serializer.data,
            'max': max_bytes['bytes__max']
        })

    def get(self, request, format=None):
        return self.post(request, format=format)


class ApplicationApiView(APIView):
    def post(self, request, format=None):
        firewall_rule_ids = get_firewall_rules_id_from_request(request)
        objects = get_objects_with_date_filtered(
            request,
            ApplicationChart,
            'logged_datetime',
            firewall_rule__in=firewall_rule_ids,
        ).values('logged_datetime', 'application__name').annotate(
            bytes=Sum('bytes')
        ).values(
            bytes=F('bytes'),
            date=F('logged_datetime'),
            application=F('application__name'),
        )
        max_bytes = objects.aggregate(Max('bytes'))
        serializer = ApplicationChartSerializer(objects, many=True)
        return Response({
            'data': serializer.data,
            'max': max_bytes['bytes__max']
        })

    def get(self, request, format=None):
        return self.post(request, format=format)


class CountryApiView(APIView):
    def post(self, request, format=None):
        filter_ids = get_filter_ids_from_request(request)
        objects = get_objects_with_date_filtered(
            request,
            IPChart,
            'logged_datetime',
            filter__in=filter_ids
        ).values('address').annotate(
            count=Sum('count')
        )

        response = defaultdict(int)

        for obj in objects:
            name, code = get_country_name_and_code(obj['address'])
            response[code] += obj['count']

        return Response(response)

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
