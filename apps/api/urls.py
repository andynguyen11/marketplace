from django.conf.urls import patterns, url

from api.payments import BillingView
from api.company import CompanyListCreate, CompanyDetail


urlpatterns = patterns(
    'apps.api',
    url(r'billing/$', view=BillingView.as_view()),
    url(r'^company/$', view=CompanyListCreate.as_view(), name='company'),
    url(r'^company/(?P<pk>[0-9]+)/$', view=CompanyDetail.as_view(), name='company-detail'),
)