from django.conf.urls import include, url  # noqa
from django.urls import path
from django.contrib import admin
from django.views.generic import TemplateView

import django_js_reverse.views

from rest_framework import routers
from .views import redirect_view
from .api import (BasicAPI, PerformanceAPI, NewsAPI, AcitivtyAPI, CoverageAPI,
                  ContactAPI, InfoAPI)

router = routers.DefaultRouter()

urlpatterns = [
    path(r'admin/', admin.site.urls, name="admin"),
    path(r'jsreverse/', django_js_reverse.views.urls_js, name="js_reverse"),


    # send home url to front end router.
    url(r'^$', TemplateView.as_view(
        template_name='index.html'), name='home'),

    # enable backend routes
    url(r'^', include(router.urls)),

    # send non backend url requests to the frontend.
    url(r'^(?!%)(?!static)(?!fav)(?!admin)(?!accounts)(?!sock)(?!js)(?!api)(?!nodeapi)(?:.*)/?$',
        TemplateView.as_view(template_name='index.html'), name='home'),
    path(r'nodeapi', redirect_view, name='nodeapi'),

    # NOTE: Test Route, please remove in future
    path(r'api/test', BasicAPI.as_view(), name="test"),
    path(r'api/performance', PerformanceAPI.as_view(), name='performance'),
    path(r'api/news', NewsAPI.as_view(), name='news'),
    path(r'api/activity', AcitivtyAPI.as_view(), name='activity'),
    path(r'api/coverage', CoverageAPI.as_view(), name='coverage'),
    path(r'api/info', InfoAPI.as_view(), name='info'),
    path(r'api/contact', ContactAPI.as_view(), name='contact')
]
