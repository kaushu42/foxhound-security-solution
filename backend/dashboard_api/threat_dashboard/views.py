from collections import defaultdict

from django.db.models import Sum, Count, F

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST

from views.views import PaginatedView

from core.models import ThreatLogDetailEvent

from serializers.serializers import ThreatLogSerializer

from globalutils.utils import (
    get_firewall_rules_id_from_request,
    to_regex,
    get_country_name_and_code,
    get_query_from_request,
    get_objects_from_query
)


class ThreatFiltersApiView(APIView):
    def _get_objs(self, objects, field_name):
        return objects.values_list(
            field_name
        ).distinct().order_by(field_name)

    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = ThreatLogDetailEvent.objects.filter(
            firewall_rule__in=firewall_ids
        )
        firewall_rule = objects.values_list(
            'firewall_rule', 'firewall_rule__name').distinct()
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


class ThreatLogTableApiView(PaginatedView):
    serializer_class = ThreatLogSerializer

    def get_filtered_objects(self, request, **kwargs):
        firewall_rule_ids = get_firewall_rules_id_from_request(request)
        query = self.get_search_queries(request)
        objects = ThreatLogDetailEvent.objects.filter(
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
            'source_address__regex': to_regex(source_ips),
            'destination_address__regex': to_regex(destination_ips),
            'log_name__contains': log_name
        }
        return {i: data[i] for i in data if data[i] is not None}

    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        query = self.get_search_queries(request)
        country = request.data.get('country', '')
        kwargs = {
            'firewall_rule__in': firewall_ids,
        }
        if country:
            kwargs['source_country'] = country

        objects = ThreatLogDetailEvent.objects.filter(
            **kwargs,
            **query
        )
        print("**************88")
        print(objects)
        page = self.paginate_queryset(objects.order_by('id'))
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
        queries = get_query_from_request(
            request, model_name='', datetime_field_name='received_datetime')
        objects = get_objects_from_query(queries, model=ThreatLogDetailEvent)
        firewall_rule_ids = get_firewall_rules_id_from_request(request)
        kwargs = {
            'firewall_rule__in': firewall_rule_ids,
        }

        country = request.data.get('country', '')
        # if country:
        #     kwargs['source_country'] = country.title()

        applications = objects.values('application').annotate(
            sum=Sum('repeat_count')
        ).order_by('-sum').values('application')[:top_count]

        objects = objects.filter(
            application__in=applications, **kwargs
        ).values(
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


class CountryApiView(APIView):
    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        queries = get_query_from_request(
            request, model_name='', datetime_field_name='received_datetime')

        objects = get_objects_from_query(
            queries,
            model=ThreatLogDetailEvent
        )

        except_countries = request.data.get('except_countries', '')
        if except_countries:
            except_countries = except_countries.split(',')

        values = defaultdict(int)
        for obj in objects:
            name, code = get_country_name_and_code(obj.source_address)
            values[code] += obj.repeat_count

        return Response({
            i: values[i] for i in values if i not in except_countries
        })


class CountryListApiView(APIView):
    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = ThreatLogDetailEvent.objects.filter(
            firewall_rule__in=firewall_ids
        ).distinct('source_address').values('source_address')
        countries = set()
        for obj in objects:
            countries.add(get_country_name_and_code(obj['source_address']))
        return Response(countries)
