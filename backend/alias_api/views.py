from django.db.models import F

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_204_NO_CONTENT

from mis.models import TrafficMisNewSourceIPDaily, TrafficMisNewDestinationIPDaily
from views.views import PaginatedView
from globalutils.utils import get_firewall_rules_id_from_request
from serializers.serializers import MisIpSerializer


class IPAliasApiView(PaginatedView):
    serializer_class = MisIpSerializer

    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)

        ip = request.data.get('ip', '')
        alias = request.data.get('alias', '')

        source_kwargs = {}
        destination_kwargs = {}
        if ip:
            source_kwargs['source_address__icontains'] = ip
            destination_kwargs['destination_address__icontains'] = ip
        if alias:
            source_kwargs['alias__icontains'] = alias
            destination_kwargs['alias__icontains'] = alias

        source_objects = TrafficMisNewSourceIPDaily.objects.filter(
            firewall_rule__in=firewall_ids,
            **source_kwargs
        ).annotate(
            address=F('source_address')
        ).values_list('address', 'alias').order_by('alias')

        destination_objects = (TrafficMisNewDestinationIPDaily.objects.filter(
            firewall_rule__in=firewall_ids,
            **destination_kwargs
        ).annotate(
            address=F('destination_address')
        ).values_list('address', 'alias').order_by('alias'))

        objects = []
        for i in (set(source_objects) | set(destination_objects)):
            objects.append({
                'address': i[0],
                'alias': i[1]
            })
        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)


class SetIPAliasApiView(APIView):
    def set_alias(self, objects, ip, alias):
        objects.update(alias=alias)

    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        ip = request.data.get('ip')
        alias = request.data.get('alias')
        try:
            objects = TrafficMisNewDestinationIPDaily.objects.filter(
                firewall_rule__in=firewall_ids,
                destination_address=ip,
            )
            self.set_alias(objects, ip, alias)

            objects = TrafficMisNewSourceIPDaily.objects.filter(
                firewall_rule__in=firewall_ids,
                source_address=ip,
            )
            self.set_alias(objects, ip, alias)
        except Exception as e:
            return Response({
                "error": e
            }, status=HTTP_204_NO_CONTENT)

        return Response({
            "status": "saved"
        })
