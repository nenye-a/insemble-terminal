from rest_framework import serializers
from .constants import LOCATION_TYPES, BUSINESS_TYPES, PERFORMANCE_DATA_TYPES, OWNERSHIP_DATA_TYPES

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


class SearchSerializer(serializers.Serializer):

    """

    Enforces the basic request schema for most endpoints that 
    are supportedby the terminal application.

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

    def validate(self, attrs):
        locationserializer = LocationSerializer(data=attrs['location'])
        businessserializer = BusinessSerializer(data=attrs['business'])

        locationserializer.is_valid(raise_exception=True)
        businessserializer.is_valid(raise_exception=True)

        attrs['location'] = locationserializer.validated_data
        attrs['business'] = businessserializer.validated_data

        return attrs


class OptionalSearchSerializer(serializers.Serializer):

    """
    Same as Search Serializer, but allows you to have location and or business,
    as long as they are serialized correctly.
    """

    location = serializers.JSONField(required=False)
    business = serializers.JSONField(required=False)

    def validate(self, attrs):
        if 'location' in attrs:
            locationserializer = LocationSerializer(data=attrs['location'])
            locationserializer.is_valid(raise_exception=True)
            attrs['location'] = locationserializer.validated_data
        if 'business' in attrs:
            businessserializer = BusinessSerializer(data=attrs['business'])
            businessserializer.is_valid(raise_exception=True)
            attrs['business'] = businessserializer.validated_data

        return attrs


class PerformanceSerializer(OptionalSearchSerializer):

    dataType = serializers.CharField(max_length=8)

    def validate(self, attrs):

        if not ('location' in attrs or 'business' in attrs):
            raise serializers.ValidationError({'status_details': [
                'Please provide either a location or a business.']})

        attrs['dataType'] = attrs['dataType'].upper()

        if attrs['dataType'] not in PERFORMANCE_DATA_TYPES:
            error_message = {}
            error_message['status_detail'] = [
                'Please provide a valid data type. Valid data types are: ' + str(PERFORMANCE_DATA_TYPES)
            ]
            raise serializers.ValidationError(error_message)

        return super().validate(attrs)


class OwnershipSerializer(OptionalSearchSerializer):

    dataType = serializers.CharField(max_length=8)

    def validate(self, attrs):

        if not ('location' in attrs or 'business' in attrs):
            raise serializers.ValidationError({'status_details': [
                'Please provide either a location or a business.']})

        attrs['dataType'] = attrs['dataType'].upper()

        if attrs['dataType'] not in OWNERSHIP_DATA_TYPES:
            error_message = {}
            error_message['status_detail'] = [
                'Please provide a valid data type. Valid data types are: ' + str(OWNERSHIP_DATA_TYPES)
            ]
            raise serializers.ValidationError(error_message)

        return super().validate(attrs)
