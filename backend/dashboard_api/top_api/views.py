import operator
from collections import defaultdict

from django.db.models import Sum

from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import (
    TrafficLogDetail,
    Country
)

from globalutils.utils import (
    get_tenant_id_from_token,
    get_query_from_request,
    get_objects_from_query,
    groupby_date
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
    basis = serializers.ChoiceField(choices, default='bytes_sent')


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
        ).values('destination_ip__address').annotate(
            data=Sum(basis)
        ).order_by('-data')
        response = []
        for data in objects[:topcount]:
            response.append([data['destination_ip__address'], data['data']])
        return Response({"data": response})

    def post(self, request):
        return self.get(request)


class ApplicationApiView(APIView):
    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        topcount, basis = get_topcount_basis(request)
        if topcount == 0:
            topcount = None
        query = get_query_from_request(request)
        # Get all the tenant logs
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id
        )
        country = request.data.get('country', None)
        if country is not None:
            ips = Country.objects.filter(iso_code=country).values('ip_address')
            objects = objects.filter(source_ip__in=ips)

        # Group by minute
        objects = groupby_date(
            objects,
            'logged_datetime',
            'hour',
            ['bytes_sent', 'bytes_received'],
            output_fields=['application__name']
        )
        top_apps = {}
        response = defaultdict(list)
        for data in objects:
            date = data['date'].timestamp()
            application = data['application__name']
            bytes_total = data['bytes_sent'] + data['bytes_received']
            top_apps[application] = top_apps.get(application, 0) + bytes_total
            response[application].append([date, bytes_total])
        final_response = {}
        for key, _ in sorted(
                top_apps.items(),
                key=operator.itemgetter(1),
                reverse=True)[:topcount]:
            final_response[key] = response[key]

        return Response({"data": final_response})

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
