from rest_framework import serializers

from core.models import (
    TrafficLog,
    TrafficLogDetail,
    VirtualSystem
)

from troubleticket.models import (
    TroubleTicketAnomaly,
    TroubleTicketFollowUpAnomaly
)

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


class TrafficLogNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLog
        fields = ('id', 'log_name')


class TrafficLogDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLogDetail
        fields = '__all__'


class TroubleTicketAnomalySerializer(serializers.ModelSerializer):
    log = TrafficLogNameSerializer()

    class Meta:
        model = TroubleTicketAnomaly
        fields = (
            'id',
            'source_ip',
            'destination_ip',
            'log',
            'source_port',
            'destination_port',
            'application',
            'bytes_sent',
            'bytes_received'
        )


class TroubleTicketFollowUpAnomalySerializer(serializers.ModelSerializer):
    trouble_ticket = TroubleTicketAnomalySerializer()
    assigned_by = UserSerializer()
    assigned_to = UserSerializer()

    class Meta:
        model = TroubleTicketFollowUpAnomaly
        fields = '__all__'


class VirtualSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualSystem
        fields = ['tenant_name']
