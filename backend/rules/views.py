import sys
import os
import subprocess
import operator
import traceback
from functools import reduce

import django
from django.db.models import Q

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

    def get_filtered_objects(self, request, **kwargs):
        firewall_rule_ids = get_firewall_rules_id_from_request(request)
        query = self.get_search_queries(request)
        objects = Rule.objects.filter(
            firewall_rule__in=firewall_rule_ids,
            **kwargs,
            **query
        )
        return objects

    def _get_items(self, field):
        if field is not None:
            return set(field.split(','))
        return None

    def get_search_queries(self, request):
        applications = request.data.get('application', None)
        source_ips = request.data.get('source_ip', None)
        destination_ips = request.data.get('destination_ip', None)
        alias = request.data.get('alias', None)
        applications = self._get_items(applications)
        data = {
            'application__in': applications,
            'source_ip__regex': to_regex(source_ips),
            'destination_ip__regex': to_regex(destination_ips),
            'alias__contains': alias,
        }
        return {i: data[i] for i in data if data[i] is not None}


class RulesApiView(RulePaginatedView):
    def get(self, request):
        objects = self.get_filtered_objects(request)
        page = self.paginate_queryset(objects.order_by('id'))
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
