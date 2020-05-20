from rest_framework import serializers
from .constants import LOCATION_TYPES, BUSINESS_TYPES, DATA_TYPES

'''

Insemble-terminal serializers to enforce request & response structure.

'''


class LocationSerializer(serializers.Serializer):

    locationType = serializers.CharField(max_length=8)
    params = serializers.CharField(max_length=255)

    def validate(self, attrs):
        attrs['locationType'] = attrs['locationType'].upper()
        valid_type = attrs['locationType'] in LOCATION_TYPES

        error_message = {}
        error_message['status_detail'] = []

        if not valid_type:
            error_message['status_detail'].append(
                'Please provide a valid location type. Valid location types are: ' + str(LOCATION_TYPES)
            )
            raise serializers.ValidationError(error_message)

        return attrs


class BusinessSerializer(serializers.Serializer):

    businessType = serializers.CharField(max_length=8)
    params = serializers.CharField(max_length=255)

    def validate(self, attrs):
        attrs['businessType'] = attrs['businessType'].upper()
        valid_type = attrs['businessType'] in BUSINESS_TYPES

        error_message = {}
        error_message['status_detail'] = []

        if not valid_type:
            error_message['status_detail'].append(
                'Please provide a valid business type. Valid business types are: ' + str(BUSINESS_TYPES)
            )
            raise serializers.ValidationError(error_message)

        return attrs


class PerformanceSerializer(serializers.Serializer):

    """

    Enforces the request schema for the /performance api endpoint.

    Schema: {
        location: {
            locationType: 'ADDRESS'|'CITY'|'COUNTY'|'STATE'|'NATION'
            params: string          
        }
        business: {
            businessType: 'BUSINESS' | 'CATEGORY'
            params: string          
        }
        dataType: 'BRAND'|'CATEGORY'|'OVERALL'|'ADDRESS'|'CITY'|'STATE'
    }

    """

    location = serializers.JSONField()
    business = serializers.JSONField()
    dataType = serializers.CharField(max_length=8)

    def validate(self, attrs):
        locationserializer = LocationSerializer(data=attrs['location'])
        businessserializer = BusinessSerializer(data=attrs['business'])

        locationserializer.is_valid(raise_exception=True)
        businessserializer.is_valid(raise_exception=True)

        attrs['location'] = locationserializer.validated_data
        attrs['business'] = businessserializer.validated_data

        attrs['dataType'] = attrs['dataType'].upper()
        if attrs['dataType'] not in DATA_TYPES:
            error_message = {}
            error_message['status_detail'] = [
                'Please provide a valid data type. Valid data types are: ' + str(DATA_TYPES)
            ]
            raise serializers.ValidationError(error_message)

        return attrs
