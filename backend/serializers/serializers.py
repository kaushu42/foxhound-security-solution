from rest_framework import serializers

from core.models import (
    TrafficLog, TrafficLogDetail,
    TrafficLogDetailHourly,
    Tenant, Domain,
    VirtualSystem,
    IPAddress,
    Application,
    Country,
    ProcessedLogDetail,
    TenantIPAddressInfo,
    TimeSeriesChart,
    FirewallRule,
    ThreatLogDetailEvent
)

from batch.models import Log as BatchMonitorLog
from mis.models import TrafficMisNewSourceIPDaily, TrafficMisNewDestinationIPDaily,TrafficMisRequestFromBlacklistedIPDaily,TrafficMisResponseToBlacklistedIPDaily

from troubleticket.models import (
    TroubleTicketAnomaly,
    TroubleTicketFollowUpAnomaly
)
from rules.models import TrafficRule
from users.models import FoxhoundUser
from globalutils.utils import get_date_from_filename


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


class UserPassworChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


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


class IPAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPAddress
        fields = ('address', 'alias')


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('name',)


class TrafficLogDetailSerializer(serializers.ModelSerializer):
    source_ip = IPAddressSerializer()
    destination_ip = IPAddressSerializer()
    application = ApplicationSerializer()

    class Meta:
        model = TrafficLogDetail
        fields = '__all__'


class FirewallRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirewallRule
        fields = ('name',)


class TrafficLogDetailGranularHourSerializer(serializers.ModelSerializer):
    firewall_rule = serializers.SerializerMethodField('get_firewall_rule_name')

    class Meta:
        model = TrafficLogDetailHourly
        exclude = ('traffic_log',)

    def get_firewall_rule_name(self, obj):
        return obj.firewall_rule.name


class TroubleTicketAnomalySerializer(serializers.ModelSerializer):
    log = TrafficLogNameSerializer()
    verified_by = UserNameSerializer()
    assigned_to = UserNameSerializer()

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


class RuleSerializer(serializers.ModelSerializer):
    verified_by_user = UserSerializer()
    source_ip_alias = serializers.CharField(required=False)
    destination_ip_alias = serializers.CharField(required=False)

    class Meta:
        model = TrafficRule
        fields = '__all__'


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ('id', 'iso_code', 'name')


class ProcessedLogDetailSerializer(serializers.Serializer):
    log = serializers.CharField()
    rows = serializers.IntegerField()
    size = serializers.IntegerField()
    processed_date = serializers.DateField(required=False)
    log_date = serializers.SerializerMethodField('get_log_date')

    def get_log_date(self, obj):
        return get_date_from_filename(obj['log'])


class TroubleTicketAnomalyLogDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    log_name = serializers.CharField()
    created_datetime = serializers.DateTimeField()
    source_ip = serializers.CharField()
    destination_ip = serializers.CharField()
    application = serializers.CharField()
    bytes_sent = serializers.IntegerField()
    bytes_received = serializers.IntegerField()
    packets_sent = serializers.IntegerField()
    packets_received = serializers.IntegerField()
    destination_port = serializers.IntegerField()
    source_port = serializers.IntegerField()
    action = serializers.CharField()
    session_end_reason = serializers.CharField()
    category = serializers.CharField()
    reasons = serializers.CharField()
    description = serializers.CharField()


class RuleEditSerializer(serializers.Serializer):
    source_ip = serializers.CharField(required=True)
    destination_ip = serializers.CharField(required=True)
    application = serializers.CharField(required=True)
    description = serializers.CharField(required=False)


class SourceDestinationIPSerializer(serializers.Serializer):
    source_ip = serializers.CharField(required=True)
    destination_ip = serializers.CharField(required=True)


class IPAliasSerializer(serializers.Serializer):
    ip = serializers.CharField(required=True)
    alias = serializers.CharField(required=True)


class TimeSeriesChartSerializer(serializers.Serializer):
    date = serializers.DateTimeField(source='logged_datetime')
    bytes = serializers.IntegerField()


class ApplicationChartSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    bytes = serializers.IntegerField()
    application = serializers.CharField()


class BatchLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchMonitorLog
        fields = '__all__'


class MisDailySourceIpSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficMisNewSourceIPDaily
        fields = '__all__'


class MisDailyDestinationIpSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficMisNewDestinationIPDaily
        fields = '__all__'


class MisIpSerializer(serializers.Serializer):
    address = serializers.CharField()
    alias = serializers.CharField(required=False)


class ThreatLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreatLogDetailEvent
        fields = '__all__'


class MisDailyRequestFromBlacklistedIpSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficMisRequestFromBlacklistedIPDaily
        fields = '__all__'


class MisDailyResponseToBlacklistedIpSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficMisResponseToBlacklistedIPDaily
        fields = '__all__'
