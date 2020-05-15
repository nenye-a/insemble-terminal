
from rest_framework import status, generics, permissions, serializers
from rest_framework.response import Response

from data.scrape import scraper
from .serializers import PerformanceSerializer

'''

Insemble-terminal Django API.

'''


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

    serializer_class = PerformanceSerializer

    def get(self, request, *args, **kwargs):
        """

        Retrieve the performance data for a brand/category & location scope.

        Parameters: {
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

        Response: {
            performance: {
                id: prismaID                
                createdAt: Date,
                updatedAt: Date,
                serachTag: {
                    location: {
                        locationType: 'ADDRESS'|'CITY'|'COUNTY'|'STATE'|'NATION'
                        params: string                                              
                    }
                    business: {
                        businessType: 'BUSINESS' | 'CATEGORY'
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

        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data

        location = params['location']
        business = params['business']
        data_type = params['dataType']

        # Determine which case we are in right now.

        return Response(params, status=status.HTTP_200_OK)
