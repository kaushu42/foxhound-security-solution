from core.models import TenantIPAddressInfo
from views.views import PaginatedView
# from serializers.serializers import IPAliasModelSerializer
from globalutils.utils import get_tenant_id_from_token


class IPAliasApiView(PaginatedView):
    # serializer_class = IPAliasModelSerializer

    def post(self, request):
        tenant_id = get_tenant_id_from_token(request)
        objects = TenantIPAddressInfo.objects.filter(
            firewall_rule__tenant__id=tenant_id).distinct('address')
        page = self.paginate_queryset(objects.order_by('address'))
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
