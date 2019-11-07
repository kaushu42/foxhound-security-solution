from urllib.parse import urlparse

from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
    HTTP_401_UNAUTHORIZED
)
from rest_framework.response import Response
from core.models import Domain

from serializers.serializers import UserSerializer, UserLoginSerializer
from .auth import token_expire_handler, expires_in

_ERROR_MESSAGE = Response(
    {'detail': 'Invalid Credentials or inactive account'},
    status=HTTP_401_UNAUTHORIZED
)


@api_view(["POST"])
@permission_classes((AllowAny,))  # Allow any user to access the sign in page
def login(request):
    login_serializer = UserLoginSerializer(data=request.data)
    if not login_serializer.is_valid():
        return Response(login_serializer.errors, status=HTTP_400_BAD_REQUEST)

    domain_url = request.data.get('domain_url')
    try:
        domain_name = urlparse(domain_url).hostname.split('.')[0]
        tenant_id = Domain.objects.get(name=domain_name).tenant.id
    except Domain.DoesNotExist as e:
        return _ERROR_MESSAGE

    user = authenticate(
        username=login_serializer.data['username'],
        password=login_serializer.data['password'],
    )
    if (not user) or (tenant_id != user.tenant_id):
        return _ERROR_MESSAGE

    # TOKEN STUFF
    token, _ = Token.objects.get_or_create(user=user)

    # token_expire_handler will check, if the token is expired it will generate new one
    # The implementation will be described further
    is_expired, token = token_expire_handler(token)
    user_serialized = UserSerializer(user)

    return Response({
        'user': user_serialized.data,
        'token': token.key,
        'full_name': f'{user.first_name} {user.last_name}',
        'tenant_name': user.tenant.name
    }, status=HTTP_200_OK)
