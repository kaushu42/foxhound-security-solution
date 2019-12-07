import sys
import os
import subprocess
import traceback

import django

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
from core.models import FirewallRule
from globalutils.utils import (
    get_tenant_id_from_token,
    get_user_from_token
)
from views.views import PaginatedView
from globalutils.utils import (
    lock_rule_table,
    is_rule_table_locked,
    unlock_rule_table
)
from .models import Rule

DELETE_RULE_FILENAME = '../dumps/delete_rules.txt'


def lock_check(func):
    def inner(*args, **kwargs):
        if is_rule_table_locked():
            return Response({
                "locked": True
            }, status=HTTP_503_SERVICE_UNAVAILABLE)
        return func(*args, **kwargs)
    return inner


class RulePaginatedView(PaginatedView):
    serializer_class = RuleSerializer


class RulesApiView(RulePaginatedView):
    @lock_check
    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = Rule.objects.filter(
            firewall_rule__tenant__id=tenant_id,
        ).order_by('id')
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class UnverifiedRulesApiView(RulePaginatedView):
    @lock_check
    def post(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = Rule.objects.filter(
            firewall_rule__tenant__id=tenant_id,
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
    @lock_check
    def post(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = Rule.objects.filter(
            firewall_rule__tenant__id=tenant_id,
            is_verified_rule=True,
        )
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)


class AnomalousRulesApiView(RulePaginatedView):
    @lock_check
    def post(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = Rule.objects.filter(
            firewall_rule__tenant__id=tenant_id,
            is_anomalous_rule=True,
        )
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)


@api_view(['POST'])
@lock_check
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
@lock_check
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
@lock_check
def edit_rule(request):
    def handle_empty_regex(string):
        if string == '*':
            return '.*'
        return string

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

    lock_rule_table()

    f = open(os.path.join(BASE_DIR, DELETE_RULE_FILENAME), 'w')
    try:
        for rule in Rule.objects.filter(**query):
            f.write(f'{rule.id}\n')
            print(rule)
    except django.db.utils.DataError as e:
        print(e)
        unlock_rule_table()
        return Response({
            "traceback": str(traceback.format_exc()),
            "exception": str(e)
        }, status=HTTP_400_BAD_REQUEST)
    f.close()
    DELETE_RULE_SCRIPT = os.path.join(BASE_DIR, '../scripts/delete_rules.py')
    subprocess.Popen([sys.executable, DELETE_RULE_SCRIPT])
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
