from collections import defaultdict

from django.db.models import Sum, Count, F

from rest_framework.views import APIView
from rest_framework.response import Response

from views.views import PaginatedView

from core.models import ThreatLogs

from serializers.serializers import ThreatLogSerializer

from globalutils.utils import (
    get_firewall_rules_id_from_request,
    to_regex,
    get_objects_with_date_filtered
)


class ThreatLogTableApiView(PaginatedView):
    serializer_class = ThreatLogSerializer

    def get_filtered_objects(self, request, **kwargs):
        firewall_rule_ids = get_firewall_rules_id_from_request(request)
        query = self.get_search_queries(request)
        objects = TroubleTicketAnomaly.objects.filter(
            firewall_rule__in=firewall_rule_ids,
            **kwargs,
            **query,
        )
        return objects.order_by('id')

    def _get_items(self, field):
        if field is not None:
            return set(field.split(','))
        return None

    def _handle_empty_string_from_frontend(self, item):
        if item == '':
            return None
        return item

    def get_search_queries(self, request):
        applications = self._handle_empty_string_from_frontend(
            request.data.get('application', None)
        )
        source_ips = self._handle_empty_string_from_frontend(
            request.data.get('source_ip', None)
        )
        destination_ips = self._handle_empty_string_from_frontend(
            request.data.get('destination_ip', None))
        log_name = self._handle_empty_string_from_frontend(
            request.data.get('log_name', None)
        )
        applications = self._get_items(applications)
        data = {
            'application__in': applications,
            'source_ip__regex': to_regex(source_ips),
            'destination_ip__regex': to_regex(destination_ips),
            'log_name__contains': log_name
        }
        return {i: data[i] for i in data if data[i] is not None}

    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        query = self.get_search_queries(request)
        objects = ThreatLogs.objects.filter(
            firewall_rule__in=firewall_ids,
            **query
        )
        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        return Response()


class ApplicationApiView(APIView):
    def post(self, request, format=None):
        top_count = int(request.data.get('topcount', 5))

        # Send all applications if top_count is 0
        # Assuming applications < 10000
        top_count = top_count if top_count else 10000

        firewall_rule_ids = get_firewall_rules_id_from_request(request)

        kwargs = {
            'firewall_rule__in': firewall_rule_ids,
        }

        objects = get_objects_with_date_filtered(
            request,
            ThreatLogs,
            'received_datetime',
            firewall_rule__in=firewall_rule_ids
        )
        applications = objects.values('application').annotate(
            sum=Sum('repeat_count')).order_by('-sum').values('application')[:top_count]

        objects = objects.filter(application__in=applications).values(
            'received_datetime',
            'application'
        ).annotate(
            repeat_count=Sum('repeat_count'),
            count=Count('firewall_rule_id'),
        ).values(
            'count',
            'repeat_count',
            date=F('received_datetime'),
            application_name=F('application'),
        ).order_by('received_datetime')

        applications = []
        max = 0

        data = defaultdict(list)

        for obj in objects:
            timestamp = obj['date'].timestamp()
            repeat_count = obj['repeat_count']
            if max < repeat_count:
                max = repeat_count
            data[obj['application_name']].append([
                timestamp,
                repeat_count
            ])

        return Response({
            'data': data,
            'max': max
        })

    def get(self, request, format=None):
        return self.post(request, format=format)
