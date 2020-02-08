import sys
import os
import subprocess
import operator
import traceback
from functools import reduce
from collections import defaultdict

import django
from django.db.models import Q, F

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_503_SERVICE_UNAVAILABLE
)
from rest_framework.views import APIView
from rest_framework import serializers
from serializers.serializers import (
    RuleSerializer,
    RuleEditSerializer
)

from backend.settings import BASE_DIR
from core.models import (
    FirewallRule,
    IPAddress
)
from mis.models import (
    DailySourceIP,
    DailyDestinationIP
)
from globalutils.utils import (
    get_firewall_rules_id_from_request,
    get_user_from_token
)
from views.views import PaginatedView
from globalutils.utils import (
    to_regex
)
from .models import Rule


class RulePaginatedView(PaginatedView):
    serializer_class = RuleSerializer

    def get_filtered_objects(self, request, return_firewall_rules=False, **kwargs):
        firewall_rule_ids = get_firewall_rules_id_from_request(request)
        query = self.get_search_queries(request)
        alias = request.data.get('alias', None)
        aliased_ips = self._get_alias_ips(alias)
        objects = Rule.objects.filter(
            firewall_rule__in=firewall_rule_ids,
            **kwargs,
            **query,
        )
        if aliased_ips is not None:
            aliased_ips = [i[0] for i in aliased_ips]
            objects = objects.filter(
                Q(source_ip__in=aliased_ips) | Q(
                    destination_ip__in=aliased_ips)
            )
        if return_firewall_rules:
            return objects, firewall_rule_ids
        return objects

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

        applications = self._get_items(applications)
        data = {
            'application__in': applications,
            'source_ip__regex': to_regex(source_ips),
            'destination_ip__regex': to_regex(destination_ips),
        }
        return {i: data[i] for i in data if data[i] is not None}

    def _get_alias_ips(self, alias):
        if alias:
            data = []
            objects = DailyDestinationIP.objects.filter(
                alias__contains=alias).annotate(
                    address=F('destination_address')
            ).values_list('address')
            data += list(objects)
            objects = DailySourceIP.objects.filter(
                alias__contains=alias).annotate(
                    address=F('source_address')
            ).values_list('address')
            data += list(objects)
            return data
        return None


class RulesApiView(RulePaginatedView):
    def get(self, request):
        objects, firewall_ids = self.get_filtered_objects(
            request, return_firewall_rules=True)
        ips = [i[0] for i in list(objects.values_list('source_ip')) +
               list(objects.values_list('destination_ip'))]
        source_ip_alias = DailySourceIP.objects.filter(
            firewall_rule__in=firewall_ids, source_address__in=ips)
        destination_ip_alias = DailyDestinationIP.objects.filter(
            firewall_rule__in=firewall_ids, destination_address__in=ips)
        # print(source_ip_alias)
        page = self.paginate_queryset(objects.order_by('id'))
        ips = {p.source_ip for p in page} | {p.destination_ip for p in page}
        aliases = list(DailySourceIP.objects.filter(
            source_address__in=ips
        ).annotate(
            address=F('source_address')
        ).values(
            'address', 'alias')) + list(DailyDestinationIP.objects.filter(
                destination_address__in=ips
            ).annotate(
                address=F('destination_address')
            ).values(
                'address', 'alias'))
        data = defaultdict(str)
        for alias in aliases:
            data[alias['address']] = alias['alias']
        for p in page:
            p.source_alias = data[p.source_ip]
            p.destination_alias = data[p.destination_ip]
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class UnverifiedRulesApiView(RulePaginatedView):
    def post(self, request):
        objects = self.get_filtered_objects(
            request,
            is_verified_rule=False,
            is_anomalous_rule=False
        )

        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)


class VerifiedRulesApiView(RulePaginatedView):
    def post(self, request):
        objects = self.get_filtered_objects(
            request,
            is_verified_rule=True
        )
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)


class AnomalousRulesApiView(RulePaginatedView):
    def post(self, request):
        objects = self.get_filtered_objects(
            request,
            is_anomalous_rule=True
        )
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)


@api_view(['POST'])
def verify_rule(request, id):
    try:
        tenant_id = get_tenant_id_from_token(request)
        rule = Rule.objects.get(id=id, firewall_rule__tenant__id=tenant_id)
    except Exception as e:
        return Response({
            "traceback": str(traceback.format_exc()),
            "exception": str(e)
        }, status=HTTP_400_BAD_REQUEST)
    rule.is_verified_rule = True
    rule.is_anomalous_rule = False
    rule.verified_by_user = get_user_from_token(request)
    rule.description = request.data.get('description', '')
    rule.save()
    return Response({
        "status": "Rule verified"
    })


@api_view(['POST'])
def flag_rule(request, id):
    try:
        tenant_id = get_tenant_id_from_token(request)
        rule = Rule.objects.get(id=id, firewall_rule__tenant__id=tenant_id)
    except Exception as e:
        return Response({
            "traceback": str(traceback.format_exc()),
            "exception": str(e)
        }, status=HTTP_400_BAD_REQUEST)
    rule.is_anomalous_rule = True
    rule.is_verified_rule = False
    rule.verified_by_user = get_user_from_token(request)
    rule.description = request.data.get('description', '')
    rule.save()
    return Response({
        "status": "Rule marked as an anomaly"
    })


@api_view(['POST'])
def edit_rule(request):

    tenant_id = get_tenant_id_from_token(request)
    serializer = RuleEditSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
    source_ip = handle_empty_regex(serializer.data['source_ip'])
    destination_ip = handle_empty_regex(serializer.data['destination_ip'])
    application = handle_empty_regex(serializer.data['application'])
    description = serializer.data.get('description', '')
    query = {
        'firewall_rule__tenant__id': tenant_id,
        'source_ip__regex': source_ip,
        'destination_ip__regex': destination_ip,
        'application__regex': application,
        'is_anomalous_rule': False
    }

    results = Rule.objects.filter(**query)
    if not results.count():
        return Response({
            "error": "Input does not match any rules"
        })
    # lock_rule_table()
    results.delete()
    # unlock_rule_table()
    firewall_rule = FirewallRule.objects.filter(tenant__id=tenant_id)[0]
    rule_name = f'{source_ip}--{destination_ip}--{application}'
    user = get_user_from_token(request)
    Rule(
        firewall_rule=firewall_rule,
        name=rule_name,
        source_ip=source_ip,
        destination_ip=destination_ip,
        application=application,
        description=description,
        is_verified_rule=True,
        is_anomalous_rule=False,
        verified_by_user=user
    ).save()
    return Response(serializer.data)
