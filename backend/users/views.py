import re
from urllib.parse import urlparse

from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
    HTTP_401_UNAUTHORIZED,
    HTTP_406_NOT_ACCEPTABLE
)
from rest_framework.response import Response
from core.models import Domain

from serializers.serializers import (
    UserSerializer,
    UserLoginSerializer,
    UserPassworChangeSerializer
)
from .auth import token_expire_handler, expires_in
from core.models import VirtualSystem

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

    domain_url = login_serializer.data['domain_url']
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


@api_view(["POST"])
def change_password(request):
    token = request.META['HTTP_AUTHORIZATION'].split()[1]
    user = Token.objects.get(key=token).user
    serializer = UserPassworChangeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
    old_password = serializer.data.get('old_password')
    new_password = serializer.data.get('new_password')
    is_correct = authenticate(
        username=user.username,
        password=old_password
    ) is not None
    if not is_correct:
        return Response({
            "error": "Old password is incorrect"
        }, status=HTTP_406_NOT_ACCEPTABLE)
    pattern = re.compile(
        '^(?=\S{6,20}$)(?=.*?\d)(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[^A-Za-z\s0-9])'
    )
    if not re.match(pattern, new_password):
        return Response({
            "error": "Password must be greater than 6 characters and less than 20 characters and must contain at least one lowercase letter, uppercase letter, special character and a digit"
        })
    user.set_password(new_password)
    user.save()
    return Response({'status': 'Password changed'})
