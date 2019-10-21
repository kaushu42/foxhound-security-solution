from core.models import TrafficLogDetail

from globalutils.views import PaginatedView
from globalutils.serializers import TrafficLogDetailSerializer


class LogApiView(PaginatedView):
    queryset = TrafficLogDetail.objects.all()
    serializer_class = TrafficLogDetailSerializer

    def get(self, request):
        page = self.paginate_queryset(self.queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
