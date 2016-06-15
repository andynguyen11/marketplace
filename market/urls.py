"""market URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from tagulous.views import autocomplete

from django.conf.urls import include, url, patterns
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.contrib.flatpages import views
from django.conf.urls import handler404, handler500
from django.views.generic.base import TemplateView
from password_reset.views import Recover

from accounts.views import error404, error500
from accounts.models import Skills

import business.views as business_views
import accounts.views as accounts_views


# TODO Break down into app level url confs
urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url(r'^$', accounts_views.home, name='home'),
    url(r'^api/', include('api.urls', namespace='api')),
    url(r'^api/docusign', include('docusign.urls', namespace='docusign')),
    url(r'^login/$', accounts_views.login, name='login'),
    url(r'^logout/$', accounts_views.logout, name='logout'),
    url(r'^skills/', autocomplete, {'tag_model': Skills}, name='skills_autocomplete'),
    url(r'^message/send/$', business_views.send_message, name='send-message'),
    url(r'^onboard/developer/$', accounts_views.developer_onboard,
        {'template': 'onboarding/developer.html'}, name='onboard-developer'),
    url(r'^onboard/manager/$', accounts_views.manager_onboard,
        {'template': 'onboarding/manager.html'}, name='onboard-manager'),
    url(r'^profile/$', accounts_views.view_profile, name='profile'),
    url(r'^profile/confirm/$', accounts_views.profile,
        {'template': 'onboarding/confirm.html'}, name='confirm-profile'),
    url(r'^profile/(?P<user_id>[0-9]+)/$', accounts_views.view_profile, name='public-profile'),
    url(r'^profile/dashboard/$', accounts_views.dashboard, name='dashboard'),
    url(r'^profile/bids/$', accounts_views.view_bids, name='view-bids'),
    url(r'^profile/projects/$', accounts_views.view_projects, name='view-projects'),
    url(r'^profile/documents/$', accounts_views.view_documents, name='view-documents'),
    url(r'^profile/skills/$', accounts_views.profile, {'template': 'skills.html'}, name='view-skills'),
    url(r'^profile/settings/account/$', accounts_views.profile,
        {'template': 'account-settings.html'}, name='account-settings'),
    url(r'^profile/settings/profile/$', accounts_views.profile,
        {'template': 'profile-settings.html'}, name='profile-settings'),
    url(r'^profile/settings/billing/$', accounts_views.profile,
        {'template': 'billing-settings.html'}, name='billing-settings'),
    url('^profile/messages/', include('postman.urls', namespace='postman', app_name='postman')),
    url(r'^project/(?P<project_id>[0-9]+)/$', business_views.view_project, name='project'),
    url(r'^project/create/$', business_views.create_project, name='create-project'),
    url(r'^(?P<type>[\w-]+)/$', business_views.projects_by_type, name='project-gallery'),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)

handler404 = error404
handler500 = error500
