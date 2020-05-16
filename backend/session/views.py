from urllib.parse import urlparse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_200_OK,
)

from core.models import Domain

from serializers.serializers import (
    DomainURLSerializer,
    TenantSerializer,
    DomainSerializer
)

from users.models import FoxhoundUser


class IsTokenValidApiView(APIView):
    def post(self, request):
        return Response({
            "valid": True
        })


class TenantInfoApiView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        domain_serializer = DomainURLSerializer(data=request.data)
        if not domain_serializer.is_valid():
            return Response(
                domain_serializer.errors,
                status=HTTP_400_BAD_REQUEST
            )
        domain_url = domain_serializer.data['domain_url']
        try:
            domain_name = urlparse(domain_url).hostname.split('.')[0]
            domain = Domain.objects.get(name=domain_name)
            name = domain.tenant.name
        except Domain.DoesNotExist as e:
            return Response({
                "error": "Domain does not exist"
            })
        return Response({
            "name": name,
            "id": domain.tenant.id
        })


class InfoApiView(APIView):
    def post(self, request):
        token = request.META.get('HTTP_AUTHORIZATION').split()[1]
        username = Token.objects.get(key=token).user
        user = FoxhoundUser.objects.get(username=username)
        full_name = f'{user.first_name} {user.last_name}'
        return Response({
            'full_name': full_name,
            'id': user.id
        })
