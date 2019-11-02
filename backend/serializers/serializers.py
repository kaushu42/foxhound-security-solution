from rest_framework import serializers

from core.models import TrafficLog, TrafficLogDetail
from troubleticket.models import TroubleTicketAnomaly, TroubleTicketFollowUpAnomaly
from users.models import FoxhoundUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoxhoundUser
        fields = ('username', 'tenant_id', 'id')


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    tenant_id = serializers.IntegerField(required=False)


class TrafficLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLog
        fields = '__all__'


class TrafficLogDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLogDetail
        fields = '__all__'


class TroubleTicketAnomalySerializer(serializers.ModelSerializer):
    class Meta:
        model = TroubleTicketAnomaly
        fields = '__all__'


class TroubleTicketFollowUpAnomalySerializer(serializers.ModelSerializer):
    class Meta:
        model = TroubleTicketFollowUpAnomaly
        fields = '__all__'
