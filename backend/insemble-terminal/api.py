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


class PerformanceAPI(BasicAPI):
    """

    All functions related to performance data.
    Performance API path: /performance

    """

    def get(self, request, *args, **kwargs):
        """

        Retrieve the performance data for a brand/category & location scope.

        Parameters: {
            location: {
                type: 'ADDRESS'|'CITY'|'COUNTY'|'STATE'|'NATION'
                params: string          
            }
            business: {
                type: 'BUSINESS' | 'CATEGORY'
                params: string          
            }
            dataType: 'BRAND'|'CATEGORY'|'OVERALL'|'ADDRESS'|'CITY'|'STATE'
        }

        Response: {
            performance: {
                id: prismaID                
                createdAt: Date,
                updatedAt: Date,
                serachTag: {
                    location: {
                        type: 'ADDRESS'|'CITY'|'COUNTY'|'STATE'|'NATION'
                        params: string                                              
                    }
                    business: {
                        type: 'BUSINESS' | 'CATEGORY'
                        params: string                                              
                    }
                }
                dataType: 'BRAND'|'CATEGORY'|'OVERALL'|'ADDRESS'|'CITY'|'STATE'     
                data: [
                    {
                        name: string,
                        salesVolumeIndex?: number,
                        avgRating?: number,
                        avgReviews?: number,
                        numLocations?: number,
                        location?: number,
                    }
                ]
            }
        }

        """

        return Response({}, status=status.HTTP_200_OK)
