import math
import datetime
import json
import traceback

from django.db.models import Avg, Count, F, Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST
)

from users.models import FoxhoundUser

from core.models import (
    TrafficLogDetailHourly
)
from mis.models import (
    TrafficMisNewDestinationIPDaily,
    TrafficMisNewSourceIPDaily
)
from troubleticket.models import (
    TroubleTicketAnomaly,
    TroubleTicketFollowUpAnomaly
)
from views.views import PaginatedView

from serializers.serializers import (
    TroubleTicketAnomalySerializer,
    TroubleTicketFollowUpAnomalySerializer,
    UserNameSerializer,
    TrafficLogDetailGranularHourSerializer,
    TroubleTicketAnomalyLogDetailSerializer
)

from globalutils.utils import (
    get_firewall_rules_id_from_request,
    get_user_from_token,
    to_regex
)


class TTPaginatedView(PaginatedView):
    serializer_class = TroubleTicketAnomalySerializer

    def get_filtered_objects(self, request, **kwargs):
        firewall_rule_ids = get_firewall_rules_id_from_request(request)
        query = self.get_search_queries(request)
        objects = TroubleTicketAnomaly.objects.filter(
            firewall_rule__in=firewall_rule_ids,
            **kwargs,
            **query,
        )
        return objects

    def _get_items(self, field):
        if field is not None:
            return set(field.split(','))
        return None

    def _handle_empty_string_from_frontend(self, item):
        if item == '':
            return None
        return item

    def get_search_queries(self, request):
        applications = self._handle_empty_string_from_frontend(
            request.data.get('application', None)
        )
        source_addresss = self._handle_empty_string_from_frontend(
            request.data.get('source_address', None)
        )
        destination_ips = self._handle_empty_string_from_frontend(
            request.data.get('destination_ip', None))
        log_name = self._handle_empty_string_from_frontend(
            request.data.get('log_name', None)
        )
        applications = self._get_items(applications)
        data = {
            'application__in': applications,
            'source_address__regex': to_regex(source_addresss),
            'destination_ip__regex': to_regex(destination_ips),
            'log__log_name__contains': log_name
        }
        return {i: data[i] for i in data if data[i] is not None}

    def _get_alias_ips(self, alias):
        if alias:
            data = []
            objects = DailyDestinationIP.objects.filter(
                alias__contains=alias).annotate(
                    address=F('destination_address')
            ).values_list('address')
            data += list(objects)
            objects = DailySourceIP.objects.filter(
                alias__contains=alias).annotate(
                    address=F('source_address')
            ).values_list('address')
            data += list(objects)
            return data
        return None


class TroubleTicketAnomalyOpenApiView(TTPaginatedView):
    def get(self, request):
        objects = self.get_filtered_objects(request, is_closed=False)
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class TroubleTicketAnomalyClosedApiView(TTPaginatedView):
    def get(self, request):
        objects = self.get_filtered_objects(request, is_closed=True)
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class MyOpenTTApiView(TTPaginatedView):
    def post(self, request):
        user = get_user_from_token(request)
        objects = self.get_filtered_objects(
            request,
            assigned_to=user,
            is_closed=False
        )
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)


class MyClosedTTApiView(TTPaginatedView):
    def post(self, request):
        user = get_user_from_token(request)
        objects = self.get_filtered_objects(
            request,
            assigned_to=user,
            is_closed=True
        )
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)


class TroubleTicketFollowUpAnomalyApiView(PaginatedView):
    queryset = TroubleTicketFollowUpAnomaly.objects
    serializer_class = TroubleTicketFollowUpAnomalySerializer

    def get(self, request, id):
        self.queryset = self.queryset.filter(
            trouble_ticket__id=id).order_by('-follow_up_datetime')
        page = self.paginate_queryset(self.queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request, id):
        try:
            tt_anomaly = TroubleTicketAnomaly.objects.get(id=id)
        except Exception as e:
            return Response({
                "traceback": str(traceback.format_exc()),
                "exception": str(e)
            }, status=HTTP_400_BAD_REQUEST)
        assigned_by_user_id = request.data.get('assigned_by_user_id')
        assigned_to_user_id = request.data.get('assigned_to_user_id')
        description = request.data.get('description')
        if (
            (assigned_by_user_id is None) or
            (assigned_to_user_id is None) or
            (description is None)
        ):
            return Response({
                "errors": {
                    "assigned_by_user_id": "This field is required",
                    "assigned_to_user_id": "This field is required",
                    "description": "This field is required",
                }
            }, status=HTTP_400_BAD_REQUEST)

        assigned_by = FoxhoundUser.objects.get(id=assigned_by_user_id)
        assigned_to = FoxhoundUser.objects.get(id=assigned_to_user_id)
        tt_anomaly.assigned_by = assigned_by
        tt_anomaly.assigned_to = assigned_to
        tt_anomaly.save()

        tt_follow_up_anomaly = TroubleTicketFollowUpAnomaly(
            trouble_ticket=tt_anomaly,
            follow_up_datetime=datetime.datetime.now(),
            assigned_by=assigned_by,
            assigned_to=assigned_to,
            description=description
        )
        tt_follow_up_anomaly.save()
        response = TroubleTicketFollowUpAnomalySerializer(
            TroubleTicketFollowUpAnomaly.objects.filter(
                trouble_ticket=tt_anomaly),
            many=True
        ).data
        return Response(response, status=HTTP_200_OK)


class TroubleTicketUsersApiView(APIView):
    def post(self, request):
        token = request.META.get('HTTP_AUTHORIZATION').split()[1]
        tenant_id = Token.objects.get(key=token).user.tenant_id

        response = UserNameSerializer(
            FoxhoundUser.objects.filter(
                tenant_id=tenant_id
            ), many=True).data
        return Response(response)


@api_view(['POST'])
def close_tt(request, id):
    now = datetime.datetime.now()
    try:
        firewall_ids = get_firewall_rules_id_from_request(request)
        trouble_ticket = TroubleTicketAnomaly.objects.get(
            id=id, firewall_rule__in=firewall_ids)
    except Exception as e:
        return Response({
            "traceback": str(traceback.format_exc()),
            "exception": str(e)
        }, status=HTTP_400_BAD_REQUEST)

    description = request.data.get('description', '')
    severity_level = request.data.get('severity_level')
    is_anomaly = int(request.data.get('is_anomaly', 'true') == 'true')
    user = get_user_from_token(request)

    trouble_ticket.is_closed = True
    trouble_ticket.is_anomaly = is_anomaly
    trouble_ticket.severity_level = severity_level
    trouble_ticket.assigned_to = user
    trouble_ticket.description = description
    trouble_ticket.verified_datetime = now
    trouble_ticket.verified_by = user
    trouble_ticket.save()

    follow_up = TroubleTicketFollowUpAnomaly(
        assigned_by=user,
        assigned_to=user,
        description=description,
        trouble_ticket=trouble_ticket,
        follow_up_datetime=now
    )
    follow_up.save()
    return Response({'ok': 'tt closed'})


class TroubleTicketDetailApiView(APIView):
    REASONS_MAP = {
        'Bytes Sent': 'bytes_sent',
        'Bytes Received': 'bytes_received',
        'Packets Sent': "packets_sent",
        'Packets Received': "packets_received",
        'Elapsed Time (sec)': "time_elapsed",
        'Destination address': "destination_address",
        'Application': "application",
        'Source Zone': "source_zone",
        'Destination Zone': "destination_zone",
        'IP Protocol': "protocol",
        'Category': "category",
        'Action': "action",
        'Session End Reason': "session_end_reason"
    }

    def get_stats(self, objects, reason, max):
        if reason in self._numeric_cols:
            return Avg(reason)
        return Count(reason)/max

    def post(self, request, id):
        firewall_rule_ids = get_firewall_rules_id_from_request(request)
        try:
            tt = TroubleTicketAnomaly.objects.get(
                id=id,
                firewall_rule__in=firewall_rule_ids
            )
            if tt.reasons:
                reasons = [
                    self.REASONS_MAP[i.strip()]
                    for i in tt.reasons.split(',')
                ]

            ip = tt.source_address
            objects = TrafficLogDetailHourly.objects.filter(
                source_address=ip,
                firewall_rule__in=firewall_rule_ids
            )
            numeric_values = objects.values('source_address').aggregate(
                ###### NUMERIC COLS SUM ##############
                bytes_sent=Sum('sum_bytes_sent'),
                bytes_received=Sum('sum_bytes_received'),
                packets_sent=Sum('sum_packets_sent'),
                packets_received=Sum('sum_packets_received'),
                time_elapsed=Sum('sum_time_elapsed'),
                n_records=Count('application')  # Count any arbitrary field
            )

            n_records = numeric_values.pop('n_records') - 1

            numeric = {}
            numeric_reasons = set()

            for reason in reasons:
                try:
                    difference = numeric_values[reason] - getattr(tt, reason)
                    numeric[reason] = format(difference/n_records, '.2f')
                    numeric_reasons.add(reason)
                except KeyError as e:
                    pass

            categorical = {}
            categorical_reasons = set(reasons) - numeric_reasons
            for reason in categorical_reasons:
                query = {reason: getattr(tt, reason)}
                count = objects.filter(**query).count()
                categorical[reason] = count
            return Response({
                "numeric": numeric,
                "categorical": categorical
            })
            query = {}
            max = objects.count()
            if max == 0:
                return Response({
                    "categorical": {},
                    "numeric": {}
                })

            for reason in reasons:
                if reason not in {'logged_datetime'}:
                    query[reason] = self.get_stats(objects, reason, max)

            stats = objects.aggregate(**query)
            categorical = {}
            numeric = {}
            for stat in stats:
                if stat in self._numeric_cols:
                    numeric[stat] = format(stats[stat], '.2f')
                else:
                    categorical[stat] = stats[stat]
            return Response({'reasons': {
                'categorical': categorical,
                'numeric': numeric
            }})

        except TroubleTicketAnomaly.DoesNotExist as e:
            return Response({"error": 'yes'})
