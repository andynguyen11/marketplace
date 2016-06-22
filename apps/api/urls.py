from django.conf.urls import patterns, url
from rest_framework_nested import routers

from api.payments import BillingView
from api.company import CompanyListCreate, CompanyDetail
from api.projects import InfoViewSet, ProjectViewSet

router = routers.SimpleRouter()

router.register('project', ProjectViewSet)

project_router = routers.NestedSimpleRouter(router, 'project', lookup='project')
project_router.register('confidentialinfo', InfoViewSet, base_name='project-confidentialinfo')

urlpatterns = [
    url(r'billing/$', view=BillingView.as_view()),
    url(r'^company/$', view=CompanyListCreate.as_view(), name='company'),
    url(r'^company/(?P<pk>[0-9]+)/$', view=CompanyDetail.as_view(), name='company-detail')
] + router.urls + project_router.urls
