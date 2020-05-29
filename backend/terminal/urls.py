from django.conf.urls import include, url  # noqa
from django.urls import path
from django.contrib import admin

import django_js_reverse.views

from rest_framework import routers
from .api import (BasicAPI, PerformanceAPI, NewsAPI, AcitivtyAPI, CoverageAPI,
                  OwnershipAPI)

router = routers.DefaultRouter()

urlpatterns = [
    path(r'admin/', admin.site.urls, name="admin"),
    path(r'jsreverse/', django_js_reverse.views.urls_js, name="js_reverse"),

    # enable backend routes
    url(r'^', include(router.urls)),

    # NOTE: Test Route, please remove in future
    path(r'api/test', BasicAPI.as_view(), name="test"),
    path(r'api/performance', PerformanceAPI.as_view(), name='performance'),
    path(r'api/news', NewsAPI.as_view(), name='news'),
    path(r'api/activity', AcitivtyAPI.as_view(), name='activity'),
    path(r'api/coverage', CoverageAPI.as_view(), name='coverage'),
    path(r'api/ownership', OwnershipAPI.as_view(), name='ownership')
]
