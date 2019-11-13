import datetime
import json

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST
)

from users.models import FoxhoundUser

from core.models import TrafficLogDetail

from troubleticket.models import (
    TroubleTicketAnomaly,
    TroubleTicketFollowUpAnomaly
)
from views.views import PaginatedView

from serializers.serializers import (
    TroubleTicketAnomalySerializer,
    TroubleTicketFollowUpAnomalySerializer,
    UserNameSerializer,
    TrafficLogDetailSerializer
)

from globalutils.utils import get_tenant_id_from_token


class TroubleTicketAnomalyApiView(PaginatedView):
    serializer_class = TrafficLogDetailSerializer

    def get(self, request):
        # Get the tenant id to filter the TTs
        tenant_id = get_tenant_id_from_token(request)

        # Get all the log details belonging to the tenant
        log_details = TrafficLogDetail.objects.filter(
            firewall_rule__tenant__id=tenant_id
        )

        # Get a list of all logs which have anomaly tts
        logs = TroubleTicketAnomaly.objects.values('log').distinct()
        # Get the row numbers for each log
        row_numbers = TroubleTicketAnomaly.objects.values(
            'row_number').distinct()

        # Using the log name and row_number get all the records which
        # are anomalous
        anomalous_logs = log_details.filter(
            traffic_log__in=logs,
            row_number__in=row_numbers
        ).order_by('-id')
        print(anomalous_logs.count())
        page = self.paginate_queryset(anomalous_logs)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class TroubleTicketFollowUpAnomalyApiView(PaginatedView):
    queryset = TroubleTicketFollowUpAnomaly.objects.filter(
        trouble_ticket__is_closed=False)
    serializer_class = TroubleTicketFollowUpAnomalySerializer

    def get(self, request, id):
        self.queryset = self.queryset.filter(
            trouble_ticket__id=id).order_by('-follow_up_datetime')
        page = self.paginate_queryset(self.queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request, id):
        print(id)
        try:
            tt_anomaly = TroubleTicketAnomaly.objects.get(id=id)
        except Exception as e:
            print([i['id']
                   for i in TroubleTicketAnomaly.objects.values('id').distinct()])
            return Response({"error": "No matching TT Found"}, status=HTTP_400_BAD_REQUEST)
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
