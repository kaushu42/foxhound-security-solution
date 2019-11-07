from rest_framework import serializers

from core.models import (
    TrafficLog, TrafficLogDetail,
    Tenant, Domain
)
from troubleticket.models import (
    TroubleTicketAnomaly,
    TroubleTicketFollowUpAnomaly
)
from users.models import FoxhoundUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoxhoundUser
        fields = ('username', 'id')


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    domain_url = serializers.CharField(required=True)


class DomainURLSerializer(serializers.Serializer):
    domain_url = serializers.CharField(required=True)


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ('id', 'name')


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'


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
            'log'
        )


class TroubleTicketFollowUpAnomalySerializer(serializers.ModelSerializer):
    trouble_ticket = TroubleTicketAnomalySerializer()
    assigned_by = UserSerializer()
    assigned_to = UserSerializer()

    class Meta:
        model = TroubleTicketFollowUpAnomaly
        fields = '__all__'
