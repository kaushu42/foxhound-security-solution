from core.models import TrafficLog, TrafficLogDetail

from views.views import PaginatedView
from serializers.serializers import (
    TrafficLogSerializer,
    TrafficLogDetailSerializer
)


class TrafficLogApiView(PaginatedView):
    queryset = TrafficLog.objects.all()
    serializer_class = TrafficLogSerializer

    def get(self, request):
        page = self.paginate_queryset(self.queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)


class TrafficLogDetailApiView(PaginatedView):
    queryset = TrafficLogDetail.objects.all()
    serializer_class = TrafficLogDetailSerializer

    def get(self, request, id):
        self.queryset = TrafficLogDetail.objects.filter(traffic_log__id=id)
        page = self.paginate_queryset(self.queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request, id):
        return self.get(request, id)
