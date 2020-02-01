import math
import datetime
import json
import traceback

from django.db.models import Avg, Count, F

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
    TrafficLogDetailGranularHour,
    TrafficLogDetail
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
        source_ips = self._handle_empty_string_from_frontend(
            request.data.get('source_ip', None)
        )
        destination_ips = self._handle_empty_string_from_frontend(
            request.data.get('destination_ip', None))
        log_name = self._handle_empty_string_from_frontend(
            request.data.get('log_name', None)
        )
        applications = self._get_items(applications)
        data = {
            'application__in': applications,
            'source_ip__regex': to_regex(source_ips),
            'destination_ip__regex': to_regex(destination_ips),
            'log__log_name__contains': log_name
        }
        return {i: data[i] for i in data if data[i] is not None}

    def _get_alias_ips(self, alias):
        if alias:
            objects = IPAddress.objects.filter(
                alias__contains=alias).values_list('address')
            return objects
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
        # Get the tenant id to filter the TTs
        objects = self.get_filtered_objects(request, is_closed=True)
        page = self.paginate_queryset(objects.order_by('id'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


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

        response = UserNameSerializer(FoxhoundUser.objects.filter(
            tenant_id=tenant_id), many=True).data
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
    user = get_user_from_token(request)
    trouble_ticket.is_closed = True
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


OPERATIONS = {
    'bytes_sent': ('bytes_sent'),
    'bytes_received': ('bytes_received'),

}


class TroubleTicketDetailApiView(APIView):
    _numeric_cols = {
        'bytes_sent',
        'bytes_received',
        'packets_sent',
        'packets_received',
        'time_elapsed'
    }

    def get_stats(self, objects, reason, max):
        if reason in self._numeric_cols:
            return Avg(reason)
        return Count(reason)/max

    def post(self, request, id):
        try:
            firewall_rule_ids = get_firewall_rules_id_from_request(request)
            tt = TroubleTicketAnomaly.objects.get(
                id=id, firewall_rule__in=firewall_rule_ids)
            reasons = [i.strip() for i in tt.reasons.split(',')]
            ip = tt.source_ip
            objects = TrafficLogDetailGranularHour.objects.filter(
                source_ip=ip, firewall_rule__in=firewall_rule_ids)
            query = {}
            max = objects.count()
            for reason in reasons:
                if '_id' in reason:
                    reason = reason.replace('_id', '')
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
