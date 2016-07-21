import tagulous

from django.conf.urls import patterns, url
from rest_framework_nested import routers

from api.account import ProfileViewSet, SkillsList, SkillTestViewSet
from api.payments import BillingView
from api.company import CompanyListCreate, CompanyDetail
from api.review import ReviewListCreate
from api.jobs import JobViewSet
from business.models import Company, Category
from api.projects import InfoViewSet, ProjectViewSet, ProjectSearchView, NDAViewSet
from expertratings.views import ExpertRatingsXMLWebhook

router = routers.SimpleRouter()
router.register('jobs', JobViewSet)
router.register('nda', NDAViewSet)
router.register('profile', ProfileViewSet)
router.register('project', ProjectViewSet)
router.register('search/project', ProjectSearchView, base_name='project-search')

project_router = routers.NestedSimpleRouter(router, 'project', lookup='project')
project_router.register('confidentialinfo', InfoViewSet, base_name='project-confidentialinfo')

profile_router = routers.NestedSimpleRouter(router, 'profile', lookup='profile')
profile_router.register('skilltest', SkillTestViewSet, base_name='profile-skilltest')

urlpatterns = [
    url(r'skills/$', view=SkillsList.as_view(), name='skills', ),
    url(r'billing/$', view=BillingView.as_view()),
    url(r'^company/$', view=CompanyListCreate.as_view(), name='company'),
    url(r'^category/$', tagulous.views.autocomplete, {'tag_model': Category}, name='company-category', ),
    url(r'^company/(?P<pk>[0-9]+)/$', view=CompanyDetail.as_view(), name='company-detail'),
    url(r'^review/$', view=ReviewListCreate.as_view(), name='review'),
    url(r'^skilltest/webhook$', view=ExpertRatingsXMLWebhook.as_view(), name='skilltest-webhook'),
] + router.urls + project_router.urls + profile_router.urls
