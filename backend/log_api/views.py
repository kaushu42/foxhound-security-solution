import traceback
import datetime
import pytz

from django.db.models import Sum, F, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_406_NOT_ACCEPTABLE,
    HTTP_400_BAD_REQUEST
)
from core.models import (
    TrafficLog, TrafficLogDetailGranularHour,
    Country,
    ProcessedTrafficLogDetail,
    ProcessedThreatLogDetail,
    Application,
    ThreatLog,
    ThreatLogDetail
)
from mis.models import (
    DailyRequestFromBlackListEvent,
    DailyResponseToBlackListEvent
)
from views.views import PaginatedView
from serializers.serializers import (
    ProcessedLogDetailSerializer,
    TrafficLogDetailGranularHourSerializer,
    SourceDestinationIPSerializer,
    ThreatLogSerializer
)
from globalutils.utils import (
    get_tenant_id_from_token,
    get_query_from_request,
    get_firewall_rules_id_from_request,
    get_date_from_filename
)


class TrafficLogApiView(PaginatedView):
    serializer_class = ProcessedLogDetailSerializer
    SIZE_PER_LOG = 468

    def get(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        objects = ProcessedTrafficLogDetail.objects.filter(
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

    def get(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        id = request.data.get('log_id', '')
        ip = request.data.get('ip', '')
        timestamp = request.data.get('timestamp', '')
        hour = request.data.get('hour', '')

        kwargs = {
            'firewall_rule__in': firewall_ids,
        }
        if id:
            kwargs['traffic_log__id'] = int(id)

        if ip:
            kwargs['source_ip'] = ip

        if hour:
            kwargs['logged_datetime__hour'] = hour

        if timestamp:
            tz_ktm = pytz.timezone('Asia/Kathmandu')
            start_date = datetime.datetime.fromtimestamp(
                int(timestamp)).astimezone(tz_ktm)
            end_date = start_date + datetime.timedelta(hours=1)
            kwargs['logged_datetime__gte'] = start_date
            kwargs['logged_datetime__lt'] = end_date

        objects = TrafficLogDetailGranularHour.objects.filter(
            **kwargs
        ).order_by('-id')

        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class RequestOriginLogApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def get(self, request):
        country = request.data.get('country', '')
        firewall_ids = get_firewall_rules_id_from_request(request)
        kwargs = {
            'firewall_rule__in': firewall_ids
        }
        if country:
            kwargs['source_country'] = country
        objects = TrafficLogDetailGranularHour.objects.filter(
            **kwargs
        )
        aggregates = objects.aggregate(
            bytes_sent=Sum('bytes_sent'),
            bytes_received=Sum('bytes_received'),
            rows=Count('firewall_rule_id')
        )
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['bytes_sent'] = aggregates['bytes_sent']
            response.data['bytes_received'] = aggregates['bytes_received']
            response.data['rows'] = aggregates['rows']
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
        firewall_ids = get_firewall_rules_id_from_request(request)
        application = request.data.get('application', '')
        timestamp = int(request.data.get('timestamp'))
        country = request.data.get('country', '')

        tz_ktm = pytz.timezone('Asia/Kathmandu')
        start_date = datetime.datetime.fromtimestamp(
            timestamp).astimezone(tz_ktm)
        end_date = start_date + datetime.timedelta(hours=1)
        kwargs = {
            'firewall_rule__in': firewall_ids,
            'application': application,
            'logged_datetime__gte': start_date,
            'logged_datetime__lt': end_date
        }
        if country:
            kwargs['source_country'] = country
        objects = TrafficLogDetailGranularHour.objects.filter(
            **kwargs
        ).order_by('id')

        page = self.paginate_queryset(objects)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response({})

    def post(self, request):
        return self.get(request)


class ThreatApplicationLogApiView(PaginatedView):
    serializer_class = ThreatLogSerializer

    def get(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        application = request.data.get('application', '')
        timestamp = request.data.get('timestamp')
        kwargs = {
            'firewall_rule__in': firewall_ids,
        }
        if application:
            kwargs['application'] = application
        if timestamp:
            timestamp = int(timestamp)
            tz_ktm = pytz.timezone('Asia/Kathmandu')
            start_date = datetime.datetime.fromtimestamp(
                timestamp).astimezone(tz_ktm)
            end_date = start_date + datetime.timedelta(hours=1)
            kwargs['received_datetime__gte'] = start_date
            kwargs['received_datetime__lt'] = end_date

        objects = ThreatLogDetail.objects.filter(
            **kwargs
        ).order_by('id')

        page = self.paginate_queryset(objects)
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


class LatestLogDateApiView(APIView):
    def get_response(self, request, model):
        firewall_ids = get_firewall_rules_id_from_request(request)
        try:
            objects = model.objects.filter(
                firewall_rule__in=firewall_ids
            ).latest('id')
            date = get_date_from_filename(objects.log)
            return Response({
                'date': date
            })
        except Exception as e:
            return Response({
                'date': datetime.date.today()
            })


class LatestTrafficLogDateApiView(LatestLogDateApiView):
    def post(self, request):
        return self.get_response(request, ProcessedTrafficLogDetail)


class LatestThreatLogDateApiView(LatestLogDateApiView):
    def post(self, request):
        return self.get_response(request, ProcessedThreatLogDetail)


class BlacklistLogApiView(PaginatedView):
    serializer_class = TrafficLogDetailGranularHourSerializer

    def post(self, request):
        firewall_ids = get_firewall_rules_id_from_request(request)
        ip = request.data.get('ip')
        objects = list(
            DailyRequestFromBlackListEvent.objects.filter(
                firewall_rule__in=firewall_ids,
                source_ip=ip
            )
        )
        objects += list(
            DailyResponseToBlackListEvent.objects.filter(
                firewall_rule__in=firewall_ids,
                destination_ip=ip
            )
        )
        page = self.paginate_queryset(objects)

        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
