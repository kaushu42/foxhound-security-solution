import traceback
import datetime

from django.db.models import Sum, F
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_406_NOT_ACCEPTABLE,
    HTTP_400_BAD_REQUEST
)
from core.models import (
    TrafficLog, TrafficLogDetailGranularHour,
    Country,
    ProcessedLogDetail,
    Application
)
from views.views import PaginatedView
from serializers.serializers import (
    ProcessedLogDetailSerializer,
    TrafficLogDetailGranularHourSerializer,
    SourceDestinationIPSerializer
)
from globalutils.utils import (
    get_tenant_id_from_token,
    get_query_from_request,
    get_firewall_rules_id_from_request
)


class TrafficLogApiView(PaginatedView):
    serializer_class = ProcessedLogDetailSerializer
    SIZE_PER_LOG = 468

    def get(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = ProcessedLogDetail.objects.filter(
            firewall_rule__in=firewall_ids
        ).values('log', 'processed_date').annotate(
            rows=Sum('rows'),
            size=F('rows')*self.SIZE_PER_LOG
        )

        page = self.paginate_queryset(objects.order_by('-log'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class TrafficLogDetailApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def get(self, request, id):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = TrafficLogDetailGranularHour.objects.filter(
            traffic_log__id=id, firewall_rule__in=firewall_ids
        ).order_by('-id')

        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request, id):
        return self.get(request, id)


class RequestOriginLogApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def get(self, request):
        country = request.data.get('country')
        if country is None:
            return Response({
                "error": "\"country\" field is required"
            })
        ips = Country.objects.filter(iso_code=country).values('ip_address')
        tenant_id = get_tenant_id_from_token(request)
        query = get_query_from_request(request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id,
            source_ip__in=ips
        ).order_by('-id')

        bytes_sent = objects.aggregate(Sum('bytes_sent'))['bytes_sent__sum']
        bytes_received = objects.aggregate(Sum('bytes_received'))[
            'bytes_received__sum']

        page = self.paginate_queryset(objects)
        for i in page:
            i.logged_datetime -= datetime.timedelta(minutes=15)
            # print(i.logged_datetime)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['bytes_sent'] = bytes_sent
            response.data['bytes_received'] = bytes_received
            response.data['rows'] = response.data['count']
            return response
        return Response({})

    def post(self, request):
        return self.get(request)


class RequestEndLogApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def get(self, request):
        country = request.data.get('country')
        if country is None:
            return Response({
                "error": "\"country\" field is required"
            }, status=HTTP_406_NOT_ACCEPTABLE)

        tenant_id = get_tenant_id_from_token(request)
        query = get_query_from_request(request)
        ips = Country.objects.filter(iso_code=country).values('ip_address')
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id,
            destination_ip__in=ips
        ).order_by('-id')
        page = self.paginate_queryset(objects)
        for i in page:
            i.logged_datetime -= datetime.timedelta(minutes=15)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})


class ApplicationLogApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def get(self, request):
        application = request.data.get('application')
        timestamp = int(request.data.get('timestamp'))
        start_date = datetime.datetime.fromtimestamp(
            timestamp / 1e3)
        end_date = start_date + datetime.timedelta(hours=1)
        if application is None:
            return Response({
                "error": "\"application\" field is required"
            }, status=HTTP_406_NOT_ACCEPTABLE)
        try:
            application_id = Application.objects.get(name=application).id
        except Exception as e:
            return Response({
                "traceback": str(traceback.format_exc()),
                "exception": str(e)
            }, status=HTTP_400_BAD_REQUEST)

        class MyRequest:
            data = {}
        my_request = MyRequest()

        for i in request.data.keys():
            my_request.data[i] = request.data[i]
        my_request.data['application'] = str(application_id)
        tenant_id = get_tenant_id_from_token(request)
        query = get_query_from_request(my_request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id,
            application__name=application,
            logged_datetime__range=(start_date, end_date)
        ).order_by('-id')
        country = request.data.get('country', None)

        if (country is not None) and (country != 'undefined'):
            ips = Country.objects.filter(iso_code=country).values('ip_address')
            objects = objects.filter(source_ip__in=ips)

        page = self.paginate_queryset(objects)
        for i in page:
            i.logged_datetime -= datetime.timedelta(minutes=15)
            # print(i.logged_datetime)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def post(self, request):
        return self.get(request)


class SankeyLogApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)

        serializer = SourceDestinationIPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors)

        source_ip = serializer.data['source_ip']
        destination_ip = serializer.data['destination_ip']

        objects = TrafficLogDetailGranularHour.objects.filter(
            firewall_rule__in=firewall_ids,
            source_ip=source_ip,
            destination_ip=destination_ip
        ).order_by('id')

        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def get(self, request):
        return self.post(request)
