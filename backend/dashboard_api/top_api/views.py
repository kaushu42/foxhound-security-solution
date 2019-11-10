from django.db.models import Sum

from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import (
    TrafficLogDetail
)

from globalutils.utils import (
    get_tenant_id_from_token,
    get_query_from_request,
    get_objects_from_query
)

from rest_framework import serializers


class TopCountBasisSerializer(serializers.Serializer):
    choices = (
        'bytes_sent',
        'bytes_received',
        'repeat_count',
        'packets_sent',
        'packets_received',
    )
    topcount = serializers.IntegerField(required=False, default=5)
    basis = serializers.ChoiceField(choices)


def get_topcount_basis(request):
    topcount_basis_serializer = TopCountBasisSerializer(data=request.data)
    if not topcount_basis_serializer.is_valid():
        return Response(topcount_basis_serializer.errors)
    data = topcount_basis_serializer.data
    topcount = data['topcount']
    basis = data['basis']
    return topcount, basis


class SourceAddressApiView(APIView):
    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        topcount, basis = get_topcount_basis(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id,
            source_ip__type=False
        ).values('source_ip__address').annotate(
            data=Sum(basis)
        ).order_by('-data')
        response = []
        for data in objects[:topcount]:
            response.append([data['source_ip__address'], data['data']])
        return Response({"data": response})

    def post(self, request):
        return self.get(request)


class DestinationAddressApiView(APIView):
    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        topcount, basis = get_topcount_basis(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id,
            source_ip__type=False
        ).values('source_ip__address').annotate(
            data=Sum(basis)
        ).order_by('-data')
        response = []
        for data in objects[:topcount]:
            response.append([data['source_ip__address'], data['data']])
        return Response({"data": response})

    def post(self, request):
        return self.get(request)


class ApplicationApiView(APIView):
    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        topcount, basis = get_topcount_basis(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id,
        ).values('application__name').annotate(
            data=Sum(basis)
        ).order_by('-data')
        response = []
        for data in objects[:topcount]:
            response.append([data['application__name'], data['data']])
        return Response({"data": response})

    def post(self, request):
        return self.get(request)


class PortApiView(APIView):
    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        topcount, basis = get_topcount_basis(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id,
        ).values('destination_port').annotate(
            data=Sum(basis)
        ).order_by('-data')
        response = []
        for data in objects[:topcount]:
            response.append([data['destination_port'], data['data']])
        return Response({"data": response})

    def post(self, request):
        return self.get(request)
