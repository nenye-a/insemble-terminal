'''

Insemble-terminal Django API.

'''

from rest_framework import status, generics, permissions, serializers
from rest_framework.response import Response
from data.scrape import scrapers


class BasicAPI(generics.GenericAPIView):
    """
    Basic API with pre-definded serializer and permission classess
    """

    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = serializers.Serializer()

    def get(self, request, *args, **kwargs):

        response = {
            'api_functioning': True
        }

        return Response(response, status=status.HTTP_200_OK)
