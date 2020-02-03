from views.views import PaginatedView
from .models import DailyDestinationIP,DailySourceIP
from serializers.serializers import MisDailySourceIpSerializer,MisDailyDestinationIpSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from utils import get_firewall_rules_id_from_request

# Create your views here.
class MisDailySourceIpApiView(APIView):
    tenant_firewall = get_firewall_rules_id_from_request(request)
    new_source_ip = DailySourceIP.objects.filter(loggedd_datetime='2020-01-26')
