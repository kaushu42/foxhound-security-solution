from django.db.models import Count, F,Sum
from views.views import PaginatedView
from .models import (
    TrafficMisNewDestinationIPDaily,
    TrafficMisNewSourceIPDaily,
    TrafficMisRequestFromBlacklistedIPDaily,
    StageTrafficMisResponseToBlacklistedIPDaily
)
from serializers.serializers import (
    MisDailySourceIpSerializer,
    MisDailyDestinationIpSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from globalutils.utils import (
    get_firewall_rules_id_from_request,
    str_to_date
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
        ips = self._get_items(request, TrafficMisNewSourceIPDaily, 'source_address')
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


class BlacklistedIP(APIView):
    def get_objects(self, request, model):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = model.objects.filter(
            firewall_rule__in=firewall_ids
        ).values('source_address', 'destination_address').annotate(sum_bytes=(Sum("sum_bytes_sent")+Sum("sum_bytes_received")))
        return objects


class SourceBlacklistedIP(BlacklistedIP):
    def post(self, request):
        objects = self.get_objects(request, TrafficMisRequestFromBlacklistedIPDaily)
        return Response(objects)


class DestinationBlacklistedIP(BlacklistedIP):
    def post(self, request):
        objects = self.get_objects(request, StageTrafficMisResponseToBlacklistedIPDaily)
        return Response(objects)
