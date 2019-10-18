from rest_framework import serializers

from rest_framework import serializers
from users.models import FoxhoundUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoxhoundUser
        fields = ('username', 'tenant_id', 'id')


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    tenant_id = serializers.IntegerField(required=False)
