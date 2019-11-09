from rest_framework import serializers

from core.models import (
    TrafficLog, TrafficLogDetail,
    Tenant, Domain,
    VirtualSystem
)
from troubleticket.models import (
    TroubleTicketAnomaly,
    TroubleTicketFollowUpAnomaly
)

from users.models import FoxhoundUser


class FilterSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    firewall_rule = serializers.IntegerField(required=False)
    application = serializers.IntegerField(required=False)
    protocol = serializers.IntegerField(required=False)
    source_zone = serializers.IntegerField(required=False)
    destination_zone = serializers.IntegerField(required=False)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoxhoundUser
        fields = ('username', 'id')


class UserNameSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return '{} {}'.format(obj.first_name, obj.last_name)

    class Meta:
        model = FoxhoundUser
        fields = ('full_name', 'id')


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
        fields = '__all__'


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
