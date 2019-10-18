from rest_framework import serializers


class FilterSerializer(serializers.Serializer):
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
    application = serializers.CharField()
    protocol = serializers.CharField()
    source_zone = serializers.CharField()
    destination_zone = serializers.CharField()
