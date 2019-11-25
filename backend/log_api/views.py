from django.db.models import Sum, F
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_406_NOT_ACCEPTABLE
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
    TrafficLogDetailGranularHourSerializer
)
from globalutils.utils import (
    get_tenant_id_from_token,
    get_query_from_request,
    get_objects_from_query
)


class TrafficLogApiView(PaginatedView):
    serializer_class = ProcessedLogDetailSerializer

    def get(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = ProcessedLogDetail.objects.filter(
            firewall_rule__tenant__id=tenant_id
        ).values('log__log_name').annotate(
            size=Sum('size'),
            rows=Sum('n_rows'),
            log_name=F('log__log_name'),
            processed_date=F('log__processed_datetime'),
            log_date=F('log__log_date')
        ).values(
            'size', 'rows',
            'log_name', 'processed_date',
            'log_date'
        ).order_by('-id')
        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class TrafficLogDetailApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def get(self, request, id):
        objects = TrafficLogDetailGranularHour.objects.filter(
            traffic_log__id=id).order_by('-id')
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
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})


class ApplicationLogApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def get(self, request):
        application = request.data.get('application')
        if application is None:
            return Response({
                "error": "\"application\" field is required"
            }, status=HTTP_406_NOT_ACCEPTABLE)
        try:
            application_id = Application.objects.get(name=application)
        except Exception as e:
            print(e)
            return Response({
                "error": "Application name error"
            })

        class MyRequest:
            data = {}
        my_request = MyRequest()
        for i in request.data.keys():
            my_request.data[i] = request.data[i]
        print(my_request.data)

        tenant_id = get_tenant_id_from_token(request)
        query = get_query_from_request(my_request)
        objects = get_objects_from_query(query).filter(
            firewall_rule__tenant__id=tenant_id,
            application__name=application
        ).order_by('-id')
        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def post(self, request):
        return self.get(request)
