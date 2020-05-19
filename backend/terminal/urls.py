from django.conf.urls import include, url  # noqa
from django.urls import path
from django.contrib import admin
from django.shortcuts import redirect

import django_js_reverse.views

from rest_framework import routers
from .api import BasicAPI, PerformanceAPI

router = routers.DefaultRouter()

urlpatterns = [
    path(r'admin/', admin.site.urls, name="admin"),
    path(r'jsreverse/', django_js_reverse.views.urls_js, name="js_reverse"),

    # enable backend routes
    url(r'^', include(router.urls)),

    # NOTE: Test Route, please remove in future
    path(r'api/test', BasicAPI.as_view(), name="test"),
    path(r'api/performance', PerformanceAPI.as_view(), name='performance')
]
