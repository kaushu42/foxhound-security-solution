from views.views import PaginatedView
from .models import Log
from serializers.serializers import BatchLogSerializer


class LogApiView(PaginatedView):
    serializer_class = BatchLogSerializer

    def get(self, request):
        objects = Log.objects.all()
        page = self.paginate_queryset(objects)

        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

    def post(self, request):
        return self.get(request)
