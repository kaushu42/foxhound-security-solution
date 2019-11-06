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
from serializers.serializers import UserSerializer, UserLoginSerializer
from .auth import token_expire_handler, expires_in
from core.models import VirtualSystem


@api_view(["POST"])
@permission_classes((AllowAny,))  # Allow any user to access the sign in page
def login(request):
    login_serializer = UserLoginSerializer(data=request.data)
    if not login_serializer.is_valid():
        return Response(login_serializer.errors, status=HTTP_400_BAD_REQUEST)
    domain_url = request.data.get('domain_name')
    domain_code = domain_url.split('//')[1].split('.')[0]
    vsys = VirtualSystem.objects.get(domain_code=domain_code)
    user = authenticate(
        username=login_serializer.data['username'],
        password=login_serializer.data['password'],
    )

    if not user or (user.id != vsys.id):
        return Response(
            {'detail': 'Invalid Credentials or activate account'},
            status=HTTP_401_UNAUTHORIZED
        )

    # TOKEN STUFF
    token, _ = Token.objects.get_or_create(user=user)

    # token_expire_handler will check, if the token is expired it will generate new one
    # The implementation will be described further
    is_expired, token = token_expire_handler(token)
    user_serialized = UserSerializer(user)

    return Response({
        'user': user_serialized.data,
        'expires_in': expires_in(token),
        'token': token.key
    }, status=HTTP_200_OK)


@api_view(["GET"])
def user_info(request):
    return Response({
        'user': request.user.username,
        'expires_in': expires_in(request.auth)
    }, status=HTTP_200_OK)
