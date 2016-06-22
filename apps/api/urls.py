import tagulous

from django.conf.urls import patterns, url
from rest_framework_nested import routers

from api.account import ProfileDetail
from api.payments import BillingView
from api.company import CompanyListCreate, CompanyDetail, JobViewSet
from api.review import ReviewListCreate
from business.models import Company
from api.projects import InfoViewSet, ProjectViewSet

router = routers.SimpleRouter()

router.register('project', ProjectViewSet)

project_router = routers.NestedSimpleRouter(router, 'project', lookup='project')
project_router.register('confidentialinfo', InfoViewSet, base_name='project-confidentialinfo')

urlpatterns = [
    url(r'billing/$', view=BillingView.as_view()),
    url(r'^company/$', view=CompanyListCreate.as_view(), name='company'),
    url(r'^job/$', JobViewSet.as_view({'get': 'list', 'post': 'create'}), name='job'),
    url(r'^company/category/$', tagulous.views.autocomplete, {'tag_model': Company}, name='company-category', ),
    url(r'^company/(?P<pk>[0-9]+)/$', view=CompanyDetail.as_view(), name='company-detail'),
    url(r'^profile/(?P<pk>[0-9]+)/$', view=ProfileDetail.as_view(), name='profile-detail'),
    url(r'^review/$', view=ReviewListCreate.as_view(), name='review'),
] + router.urls + project_router.urls