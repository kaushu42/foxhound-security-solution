from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

from serializers.serializers import RuleSerializer

from globalutils.utils import (
    get_tenant_id_from_token
)
from views.views import PaginatedView
from .models import Rule


class RulesApiView(PaginatedView):
    serializer_class = RuleSerializer

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
def unverified_rules(request):
    tenant_id = get_tenant_id_from_token(request)
    objects = Rule.objects.filter(
        firewall_rule__tenant__id=tenant_id,
        is_verified_rule=False,
    )
    rule_serializer = RuleSerializer(objects, many=True)
    return Response(rule_serializer.data)


@api_view(['POST'])
def anomalous_rules(request):
    tenant_id = get_tenant_id_from_token(request)
    objects = Rule.objects.filter(
        firewall_rule__tenant__id=tenant_id,
        is_anomalous_rule=True,
    )
    rule_serializer = RuleSerializer(objects, many=True)
    return Response(rule_serializer.data)
