from django.db.models import Count, F, Sum
from views.views import PaginatedView
from .models import (
    TrafficMisNewDestinationIPDaily,
    TrafficMisNewSourceIPDaily,
    TrafficMisRequestFromBlacklistedIPDaily,
    TrafficMisResponseToBlacklistedIPDaily
)
from rest_framework.views import APIView
from rest_framework.response import Response
from globalutils.utils import (
    get_firewall_rules_id_from_request,
    str_to_date,
    get_objects_with_date_filtered
)

from serializers.serializers import (
    MisDailyRequestFromBlacklistedIpSerializer,
    MisDailyResponseToBlacklistedIpSerializer
)


class DailyApiView(APIView):
    def _get_items(self, request, model, field_name):
        firewall_ids = get_firewall_rules_id_from_request(request)
        date = str_to_date(request.data.get('date', ''))
        if not date:
            date = model.objects.latest(
                'logged_datetime'
            ).logged_datetime

        objects = model.objects.filter(
            firewall_rule__in=firewall_ids,
            logged_datetime=date
        ).values_list(field_name, 'firewall_rule__name')

        return objects


class DailySourceIpApiView(DailyApiView):
    def post(self, request):
        ips = self._get_items(
            request, TrafficMisNewSourceIPDaily, 'source_address')
        return Response(ips)


class DailyDestinationIpApiView(DailyApiView):
    def post(self, request):
        ips = self._get_items(request, TrafficMisNewDestinationIPDaily,
                              'destination_address')
        return Response(ips)


class IPCountChart(APIView):
    def _get_items(self, request, model):
        firewall_ids = get_firewall_rules_id_from_request(request)

        objects = model.objects.filter(
            firewall_rule__in=firewall_ids
        ).values('logged_datetime').annotate(
            count=Count('firewall_rule'),
            date=F('logged_datetime')
        ).values('date', 'count').order_by('logged_datetime')
        items = []
        for obj in objects:
            timestamp = obj['date'].strftime("%s")
            count = obj['count']
            items.append([timestamp, count])
        return items


class SourceIPCountChart(IPCountChart):
    def post(self, request):
        items = self._get_items(request, TrafficMisNewSourceIPDaily)
        return Response(items)


class DestinationIPCountChart(IPCountChart):
    def post(self, request):
        items = self._get_items(request, TrafficMisNewDestinationIPDaily)
        return Response(items)


class MisRequestsFromBlackistListedIPAPIView(PaginatedView):
    serializer_class = MisDailyRequestFromBlacklistedIpSerializer
    def get(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = TrafficMisRequestFromBlacklistedIPDaily.objects.filter(
            firewall_rule__in=firewall_ids
        )
        page = self.paginate_queryset(objects.order_by('-logged_datetime'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
   
    def post(self, request):
        return self.get(request)   

class MisResponsesToBlackistListedIPAPIView(PaginatedView):
    serializer_class = MisDailyResponseToBlacklistedIpSerializer
    def get(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = TrafficMisResponseToBlacklistedIPDaily.objects.filter(
            firewall_rule__in=firewall_ids
        )
        page = self.paginate_queryset(objects.order_by('-logged_datetime'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
   
    def post(self, request):
        return self.get(request)   


class BlacklistedIP(APIView):
    def get_objects(self, request, model):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = model.objects.filter(firewall_rule__in=firewall_ids).values('source_address', 'destination_address').distinct()
        return objects


class SourceBlacklistedIP(BlacklistedIP):
    def post(self, request):
        objects = self.get_objects(
            request, TrafficMisRequestFromBlacklistedIPDaily)
        return Response(objects)


class DestinationBlacklistedIP(BlacklistedIP):
    def post(self, request):
        objects = self.get_objects(
            request, TrafficMisResponseToBlacklistedIPDaily)
        return Response(objects)
