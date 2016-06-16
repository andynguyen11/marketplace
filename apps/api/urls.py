from django.conf.urls import patterns, url

from api.account import ProfileDetail
from api.payments import BillingView
from api.company import CompanyListCreate, CompanyDetail
from api.review import ReviewListCreate

urlpatterns = [
    url(r'billing/$', view=BillingView.as_view()),
    url(r'^company/$', view=CompanyListCreate.as_view(), name='company'),
    url(r'^company/(?P<pk>[0-9]+)/$', view=CompanyDetail.as_view(), name='company-detail'),
    url(r'^profile/(?P<pk>[0-9]+)/$', view=ProfileDetail.as_view(), name='profile-detail'),
    url(r'^review/$', view=ReviewListCreate.as_view(), name='review'),
]
