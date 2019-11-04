import datetime
import json

from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_406_NOT_ACCEPTABLE
from core.models import User

from troubleticket.models import (
    TroubleTicketAnomaly,
    TroubleTicketFollowUpAnomaly
)
from views.views import PaginatedView

from serializers.serializers import (
    TroubleTicketAnomalySerializer,
    TroubleTicketFollowUpAnomalySerializer
)


class TroubleTicketAnomalyApiView(PaginatedView):
    queryset = TroubleTicketAnomaly.objects.all()
    serializer_class = TroubleTicketAnomalySerializer

    def get(self, request):
        page = self.paginate_queryset(self.queryset)
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
        tt_anomaly = TroubleTicketAnomaly.objects.get(id=id)
        assigned_by_user_id = request.POST.get('assigned_by_user_id')
        assigned_to_user_id = request.POST.get('assigned_to_user_id')
        description = request.POST.get('description')
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
            }, status=HTTP_406_NOT_ACCEPTABLE)

        assigned_by = User.objects.get(id=assigned_by_user_id)
        assigned_to = User.objects.get(id=assigned_to_user_id)
        tt_follow_up_anomaly = TroubleTicketFollowUpAnomaly(
            trouble_ticket=tt_anomaly,
            follow_up_datetime=datetime.datetime.now(),
            assigned_by=assigned_by,
            assigned_to=assigned_to,
            description=description
        )
        tt_follow_up_anomaly.save()
        return Response({
            "success": "Trouble Ticket follow up created"
        }, status=HTTP_200_OK)
