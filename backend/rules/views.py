from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
from rest_framework import serializers
from serializers.serializers import RuleSerializer

from core.models import FirewallRule
from globalutils.utils import (
    get_tenant_id_from_token,
    get_user_from_token
)
from views.views import PaginatedView
from .models import Rule


class RuleEditSerializer(serializers.Serializer):
    source_ip = serializers.CharField(required=True)
    destination_ip = serializers.CharField(required=True)
    application = serializers.CharField(required=True)


class RulePaginatedView(PaginatedView):
    serializer_class = RuleSerializer


class RulesApiView(RulePaginatedView):
    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = Rule.objects.filter(
            firewall_rule__tenant__id=tenant_id,
        ).order_by('id')
        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class UnverifiedRulesApiView(RulePaginatedView):
    def post(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = Rule.objects.filter(
            firewall_rule__tenant__id=tenant_id,
            is_verified_rule=False,
            is_anomalous_rule=False
        )
        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)


class VerifiedRulesApiView(RulePaginatedView):
    def post(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = Rule.objects.filter(
            firewall_rule__tenant__id=tenant_id,
            is_verified_rule=True,
        )
        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)


class AnomalousRulesApiView(RulePaginatedView):
    def post(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = Rule.objects.filter(
            firewall_rule__tenant__id=tenant_id,
            is_anomalous_rule=True,
        )
        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)


@api_view(['POST'])
def verify_rule(request, id):
    try:
        rule = Rule.objects.get(id=id)
    except Exception as e:
        print(e)
        return Response({
            "error": "Bad id"
        }, status=HTTP_400_BAD_REQUEST)
    rule.is_verified_rule = True
    rule.save()
    return Response({
        "status": "Rule verified"
    })


@api_view(['POST'])
def flag_rule(request, id):
    try:
        rule = Rule.objects.get(id=id)
    except Exception as e:
        print(e)
        return Response({
            "error": "Bad id"
        }, status=HTTP_400_BAD_REQUEST)
    rule.is_anomalous_rule = True
    rule.save()
    return Response({
        "status": "Rule marked as an anomaly"
    })


@api_view(['POST'])
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

    query = {
        'firewall_rule__tenant__id': tenant_id,
        'source_ip__regex': source_ip,
        'destination_ip__regex': destination_ip,
        'application__regex': application,
        'is_anomalous_rule': False
    }
    create_new_rule = False
    for rule in Rule.objects.filter(**query):
        print(
            f"Deleted {rule.source_ip}--{rule.destination_ip}--{rule.application}"
        )
        rule.delete()
        create_new_rule = True
    firewall_rule = FirewallRule.objects.filter(tenant__id=tenant_id)[0]
    rule_name = f'{source_ip}--{destination_ip}--{application}'
    user = get_user_from_token(request)
    print('Create new rule: ', create_new_rule)
    if create_new_rule:
        Rule(
            firewall_rule=firewall_rule,
            name=rule_name,
            source_ip=source_ip,
            destination_ip=destination_ip,
            application=application,
            description='Generic Rule',
            is_verified_rule=True,
            is_anomalous_rule=False,
            verified_by_user=user
        ).save()

    return Response(serializer.data)
