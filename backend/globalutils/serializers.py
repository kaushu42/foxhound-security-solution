from rest_framework import serializers

from core.models import TrafficLog, TrafficLogDetail


class TrafficLogDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficLogDetail
        fields = '__all__'
