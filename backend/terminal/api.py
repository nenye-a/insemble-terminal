
from rest_framework import status, generics, permissions, serializers
from rest_framework.response import Response

from .serializers import SearchSerializer, PerformanceSerializer
import data.performance as performance
import data.news as news
import datetime as dt

'''

terminal Django API.

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
    Performance API path: api/performance

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
                createdAt: Date,
                updatedAt: Date,
                dataType: 'BRAND'|'CATEGORY'|'OVERALL'|'ADDRESS'|'CITY'|'STATE'
                data: [
                    {
                        name: string,
                        salesVolumeIndex?: number,
                        avgRating?: number,
                        avgReviews?: number,
                        numLocations?: number,
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

        data = []
        if business['businessType'] == 'BUSINESS':
            # Details for the business.
            if location['locationType'] == 'ADDRESS':
                row = performance.performance(business['params'], location['params'])
                if not row:
                    pass
                elif data_type == 'ADDRESS':
                    row['name'] = row.pop('address')
                    data.append(row)
                elif data_type == 'OVERALL':
                    row.pop('address')
                    data.append(row)
                else:
                    error = "{data_type} not supported for request ADDRESS + BUSINESS requests.".format(
                        data_type=data_type
                    )
                    return Response({'status_detail': [error]}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'status_detail': ['Unimplemented']}, status=status.HTTP_501_NOT_IMPLEMENTED)
        elif business['businessType'] == 'CATEGORY':
            return Response({'status_detail': ['Unimplemented']}, status=status.HTTP_501_NOT_IMPLEMENTED)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

        now = dt.datetime.utcnow()
        result = {
            'createAt': now,
            'updatedAt': now,
            'dataType': data_type,
            'data': data
        }

        return Response(result, status=status.HTTP_200_OK)


class NewsAPI(BasicAPI):

    serializer_class = SearchSerializer

    def get(self, request, *args, **kwargs):
        """

        Retrieve the news data for a brand/category & location scope.

        Parameters: {
            location: {
                locationType: 'ADDRESS'|'CITY'|'COUNTY'|'STATE'|'NATION'
                params: string
            }
            business: {
                businessType: 'BUSINESS' | 'CATEGORY'
                params: string
            }
        }

        Response: {
            news: {
                createdAt: Date,
                updatedAt: Date,
                data: [
                    {
                        title: string,
                        link: url_string,
                        published: Date,
                        source: string,
                        description: string,
                        relevance: float
                    },
                ]
            }
        }

        """

        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data

        location = params['location']['params']
        business = params['business']['params']

        data = news.news(business, location)

        now = dt.datetime.utcnow()
        return Response({
            'createdAt': now,
            'updatedAt': now,
            'data': data
        })
