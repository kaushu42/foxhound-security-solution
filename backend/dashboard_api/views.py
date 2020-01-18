from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response

from globalutils.utils import get_filter_ids_from_request

from core.models import Filter, FirewallRule, TimeSeriesChart


class StatsApiView(APIView):
    def post(self, request):
        filter_ids = get_filter_ids_from_request(request)

        return Response(
            TimeSeriesChart.objects.filter(filter__in=filter_ids)
            .aggregate(
                bytes_sent=Sum('bytes_sent'),
                bytes_received=Sum('bytes_received')
            )
        )
        # return Response({"hello": 'ok'})
