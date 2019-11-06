from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny

from core.models import VirtualSystem

from serializers.serializers import VirtualSystemSerializer

from users.models import FoxhoundUser


class TenantInfoApiView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        domain_url = request.data.get('domain_name')
        domain_code = domain_url.split('//')[1].split('.')[0]
        vsys = VirtualSystem.objects.filter(domain_code=domain_code)
        data = VirtualSystemSerializer(vsys, many=True)
        if not data.data:
            return Response(
                {'error': 'Invalid client'},
                status=HTTP_400_BAD_REQUEST)
        return Response(data.data)


class TokenValidatorApiView(APIView):
    def post(self, request):
        token = request.META.get('HTTP_AUTHORIZATION').split()[1]
        token = Token.objects.get(key=token)
        return Response({
            'token_is_valid': True
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
