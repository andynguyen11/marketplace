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
import rest_framework.urls

from accounts.views import error404, error500
from accounts.models import Skills

import business.views as business_views
import accounts.views as accounts_views

import business.signals

# TODO Break down into app level url confs
urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url(r'^$', accounts_views.home, name='home'),
    url(r'^company/(?P<company_slug>[-\w]+)/$', business_views.company_profile, name='company'),
    url(r'^welcome/$', TemplateView.as_view(template_name='welcome.html'), name='welcome'),
    url(r'^how/$', TemplateView.as_view(template_name='how.html'), name='how'),
    url(r'^api/', include('api.urls', namespace='api')),
    url(r'^api/docusign/', include('docusign.urls', namespace='docusign')),
    url(r'^login/$', accounts_views.user_login, name='login'),
    url(r'^logout/$', accounts_views.logout, name='logout'),
    url(r'', include('password_reset.urls')),
    url(r'^skills/', autocomplete, {'tag_model': Skills}, name='skills_autocomplete'),
    url(r'^signup/$', accounts_views.signup, name='signup'),
    url(r'^about/$', TemplateView.as_view(template_name='about.html'), name='about'),
    url(r'^careers/$', TemplateView.as_view(template_name='careers.html'), name='careers'),
    url(r'^contact/$', TemplateView.as_view(template_name='contact.html'), name='contact'),
    url(r'^privacy/$', TemplateView.as_view(template_name='privacy.html'), name='privacy'),
    url(r'^terms-of-service/$', TemplateView.as_view(template_name='terms.html'), name='terms'),
    url(r'^dmca/$', TemplateView.as_view(template_name='dmca.html'), name='dmca'),
    url(r'^prelaunch/$', TemplateView.as_view(template_name='prelaunch_router.html'), name='prelaunch-router'),
    url(r'^signup/type/$', TemplateView.as_view(template_name='onboarding/confirm.html'), name='signup-type'),
    url(r'^signup/developer/$', TemplateView.as_view(template_name='onboarding/base.html'), name='signup-developer'),
    url(r'^signup/entrepreneur/$', TemplateView.as_view(template_name='onboarding/base.html'), name='signup-entrepreneur'),
    url(r'^signup/prelaunch/$', TemplateView.as_view(template_name='onboarding/base.html'), name='signup-prelaunch'),
    url(r'^profile/$', TemplateView.as_view(template_name='spa.html'), name='profile'),
    url(r'^profile/(?P<user_id>[0-9]+)/$', TemplateView.as_view(template_name='spa.html'), name='public-profile'),
    #url(r'^profile/$', accounts_views.view_profile, name='profile'),
    #url(r'^profile/(?P<user_id>[0-9]+)/$', accounts_views.view_profile, name='public-profile'),
    url(r'^profile/dashboard/$', accounts_views.dashboard, name='dashboard'),
    url(r'^profile/bids/$', accounts_views.view_bids, name='view-bids'),
    url(r'^profile/projects/$', accounts_views.view_projects, name='view-projects'),
    url(r'^profile/documents/$', accounts_views.view_documents, name='view-documents'),
    url(r'^profile/skills/$', accounts_views.profile, {'template': 'skills.html'}, name='view-skills'),
    url(r'^profile/settings/$', accounts_views.profile, {'template': 'settings.html'}, name='settings'),
    url(r'^profile/messages/', include('postman.urls', namespace='postman', app_name='postman')),
    url(r'^company/create/$', TemplateView.as_view(template_name='create_company.html'),  name='create-company'),
    url(r'^project/create/', TemplateView.as_view(template_name='spa.html'), name='create-project'),
    url(r'^project/edit/', TemplateView.as_view(template_name='spa.html'), name='edit-project'),
    #url(r'^project/create/$', business_views.create_project, name='create-project'),
    #url(r'^project/edit/$', business_views.create_project, name='edit-project'),
    #url(r'^project/edit/(?P<project_id>[0-9]+)/$', business_views.create_project, name='edit-project'),
    url(r'^project/(?P<project_slug>[-\w]+)/$', business_views.view_project, name='project'),
    url(r'^project/delete/(?P<project_id>[0-9]+)/$', business_views.delete_project, name='delete-project'),
    url(r'^projects/$', business_views.discover_projects, name='project-gallery'),
    url(r'^projects/(?P<type>[\w-]+)/$', business_views.discover_projects, name='project-gallery'),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^discover/developers/(?P<role>[-\w]+)/$', accounts_views.discover_developers,name='discover-developers'),
    url(r'^social/complete/$', accounts_views.psa_redirect, name='social-redirect'),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)

if settings.DEBUG and settings.MEDIA_URL :
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns.append(url(r'^docs/', include('rest_framework_docs.urls')))

handler404 = error404
handler500 = error500
