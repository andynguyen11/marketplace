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
from django.conf.urls import include, url, patterns
from django.conf import settings
from django.contrib import admin
from django.conf.urls.static import static
from django.contrib.flatpages import views
from django.conf.urls import handler404, handler500
from django.views.generic.base import TemplateView
from password_reset.views import Recover

from apps.landing_pages.views import error404, error500


urlpatterns = patterns('apps',
    url(r'^admin/', include(admin.site.urls)),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url(r'^$', 'accounts.views.home', name='home'),
    url(r'^login/$', 'accounts.views.login', name='login'),
    url(r'^logout/$', 'accounts.views.logout', name='logout'),
    url(r'^profile/$', 'accounts.views.view_profile', name='profile'),
    url(r'^profile/(?P<user_id>[0-9]+)/$', 'accounts.views.view_profile', name='public-profile'),
    url(r'^profile/edit/$', 'accounts.views.edit_profile', name='edit-profile'),
    url(r'^profile/dashboard/$', 'accounts.views.dashboard', name='dashboard'),
    url(r'^profile/message/send/$', 'accounts.views.send_message', name='send-message'),
    url('^profile/messages/', include('postman.urls', namespace='postman', app_name='postman')),
    url(r'^project/(?P<project_id>[0-9]+)/$', 'business.views.view_project', name='project'),
    url(r'^project/create/$', 'business.views.create_project', name='create-project'),
) + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)

handler404 = error404
handler500 = error500