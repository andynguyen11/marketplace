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
from django.contrib.admin.views.decorators import staff_member_required
from django.conf.urls.static import static
from django.contrib.flatpages import views
from django.conf.urls import handler404, handler500
from django.views.generic.base import TemplateView
import rest_framework.urls

from accounts.decorators import email_confirmation_required
from accounts.views import error404, error500
from accounts.models import Skills
from generics.views import health

import accounts.views as accounts_views
from business.views import ProjectsView
from django.contrib.auth.decorators import login_required

import business.signals
import accounts.signals

# TODO Break down into app level url confs
urlpatterns = [
    url(r'^internal/admin/', include(admin.site.urls)),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url(r'^$', accounts_views.home, name='home'),
    url(r'^status/$', health, name='health'),
    url(r'^signup/confirm/$', login_required(TemplateView.as_view(template_name='signup-confirm.html')), name='signup-confirm'),
    url(r'^confirm-email/$', login_required(TemplateView.as_view(template_name='confirm_email.html')), name='confirm_email'),
    url(r'^how/$', TemplateView.as_view(template_name='how.html'), name='how'),
    url(r'^confirmed/$', TemplateView.as_view(template_name='email_confirmed.html'), name='email_confirmed'),
    url(r'^api/', include('api.urls', namespace='api')),
    url(r'^notifications', TemplateView.as_view(template_name='spa.html'), name='notifications-index'),
    url(r'^dashboard/connections/', TemplateView.as_view(template_name='spa.html'), name='connections'),
    url(r'^dashboard/project/(?P<project_slug>[-\w]+)/?$', TemplateView.as_view(template_name='spa.html'), name='view-project'),
    url(r'^dashboard/project/(?P<project_slug>[-\w]+)/hired/?$', TemplateView.as_view(template_name='spa.html'), name='project-hired'),
    url(r'^dashboard/projects', TemplateView.as_view(template_name='spa.html'), name='view-projects'),
    url(r'^dashboard/proposal/(?P<proposal_id>[\d]+)/?$', TemplateView.as_view(template_name='spa.html'), name='view-proposal'),
    url(r'^dashboard/proposals', TemplateView.as_view(template_name='spa.html'), name='view-bids'),
    url(r'^dashboard/skills/', TemplateView.as_view(template_name='spa.html'), name='view-skills'),
    url(r'^dashboard/messages/inbox', TemplateView.as_view(template_name='spa.html'), name='messages-inbox'),
    url(r'^dashboard/messages/(?P<thread_id>[\d]+)/?$', TemplateView.as_view(template_name='spa.html'), name='view-conversation'),
    # url(r'^dashboard/messages/', include('postman.urls', namespace='postman', app_name='postman')),
    url(r'^login/$', accounts_views.user_login, name='login'),
    url(r'^logout/$', accounts_views.logout, name='logout'),
    url(r'', include('password_reset.urls')),
    url(r'^skills/', autocomplete, {'tag_model': Skills}, name='skills_autocomplete'),
    url(r'^signup/?$', TemplateView.as_view(template_name='spa.html'), name='signup'),
    url(r'^about/$', TemplateView.as_view(template_name='about.html'), name='about'),
    url(r'^careers/$', TemplateView.as_view(template_name='careers.html'), name='careers'),
    url(r'^contact/$', TemplateView.as_view(template_name='contact.html'), name='contact'),
    url(r'^privacy/$', TemplateView.as_view(template_name='privacy.html'), name='privacy'),
    url(r'^nda/$', TemplateView.as_view(template_name='nda.html'), name='nda'),
    url(r'^resources/?$', TemplateView.as_view(template_name='spa.html'), name='resources'),
    url(r'^terms-of-service/$', TemplateView.as_view(template_name='terms.html'), name='terms'),
    url(r'^diversity/$', TemplateView.as_view(template_name='diversity.html'), name='diversity'),
    url(r'^dmca/$', TemplateView.as_view(template_name='dmca.html'), name='dmca'),
    url(r'^invoices', TemplateView.as_view(template_name='spa.html'), name='invoices'),
    url(r'^invoices/received', TemplateView.as_view(template_name='spa.html'), name='invoices-received'),
    url(r'^invoices/sent', TemplateView.as_view(template_name='spa.html'), name='invoices-sent'),
    url(r'^invoices/new', TemplateView.as_view(template_name='spa.html'), name='invoices-new'),
    url(r'^invoices/new/type', TemplateView.as_view(template_name='spa.html'), name='invoices-type'),
    url(r'^invoices/new/recipient', TemplateView.as_view(template_name='spa.html'), name='invoices-recipient'),
    url(r'^invoices/new/invoice', TemplateView.as_view(template_name='spa.html'), name='invoices-items'),
    url(r'^invoices/new/confirmation/?$', TemplateView.as_view(template_name='spa.html'), name='invoices-confirmation'),
    url(r'^invoices/(?P<invoice_id>[-\w\d]+)', TemplateView.as_view(template_name='spa.html'), name='invoice-detail'),
    url(r'^invoices/(?P<invoice_id>[-\w\d]+)/payment/?$', TemplateView.as_view(template_name='spa.html'), name='invoice-payment'),
    url(r'^invoices/(?P<invoice_id>[-\w\d]+)/payment/review/?$', TemplateView.as_view(template_name='spa.html'), name='invoice-payment'),
    url(r'^invoices/(?P<invoice_id>[-\w\d]+)/payment/confirmation/?$', TemplateView.as_view(template_name='spa.html'), name='invoice-payment'),
    url(r'^invoices/(?P<invoice_id>[-\w\d]+)/edit/?$', TemplateView.as_view(template_name='spa.html'), name='invoice-edit'),
    url(r'^invoices/(?P<invoice_id>[-\w\d]+)/edit/confirmation/?$', TemplateView.as_view(template_name='spa.html'), name='invoice-edit-confirm'),
    url(r'^profile/?$', TemplateView.as_view(template_name='spa.html'), name='profile'),
    url(r'^profile/(?P<user_id>[0-9]+)/?$', TemplateView.as_view(template_name='spa.html'), name='public-profile'),
    url(r'^profile/dashboard/?$', TemplateView.as_view(template_name='spa.html'), name='dashboard'),
    url(r'^profile/dashboard/freelancer/?$', TemplateView.as_view(template_name='spa.html'), name='freelancer-dashboard'),
    url(r'^profile/dashboard/entrepreneur/?$', TemplateView.as_view(template_name='spa.html'), name='entrepreneur-dashboard'),
    url(r'^settings', TemplateView.as_view(template_name='spa.html'), name='settings-index'),
    url(r'^profile/settings', TemplateView.as_view(template_name='spa.html'), name='settings'),
    url(r'^profile/settings/account', TemplateView.as_view(template_name='spa.html'), name='account-settings'),
    url(r'^profile/settings/company', TemplateView.as_view(template_name='spa.html'), name='company-settings'),
    url(r'^profile/settings/password', TemplateView.as_view(template_name='spa.html'), name='password-settings'),
    url(r'^project/pricing', TemplateView.as_view(template_name='spa.html'), name='project-pricing'),
    url(r'^project/create', TemplateView.as_view(template_name='spa.html'), name='create-project'),
    url(r'^project/edit', TemplateView.as_view(template_name='spa.html'), name='edit-project'),
    url(r'^project/upgrade/(?P<project_slug>[-\w]+)', TemplateView.as_view(template_name='spa.html'), name='upgrade-renewal'),
    url(r'^project/renew/(?P<project_slug>[-\w]+)', TemplateView.as_view(template_name='spa.html'), name='project-renewal'),
    url(r'^project/(?P<project_slug>[-\w]+)/?$', ProjectsView.as_view(template_name='spa.html'), name='project'),
    url(r'^project/(?P<project_slug>[-\w]+)/submit-proposal/?$', TemplateView.as_view(template_name='spa.html'), name='submit-proposal'),
    url(r'^project/(?P<project_slug>[-\w]+)/submit-proposal/confirmation/?$', TemplateView.as_view(template_name='spa.html'), name='submit-proposal-confirmation'),
    url(r'^projects/?$',  TemplateView.as_view(template_name='spa.html'), name='project-gallery'),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^discover/developers/(?P<role>[-\w]+)/$', accounts_views.discover_developers,name='discover-developers'),
    url(r'^social/complete/$', accounts_views.psa_redirect, name='social-redirect'),
    url(r'^onboard', TemplateView.as_view(template_name='spa.html'), name='onboard-entry'),
    url(r'^onboard/role/?$', TemplateView.as_view(template_name='spa.html'), name='onboard-roles'),
    url(r'^onboard/skills/?$', TemplateView.as_view(template_name='spa.html'), name='onboard-skills'),
    url(r'^onboard/profile/?$', TemplateView.as_view(template_name='spa.html'), name='onboard-profile'),
    url(r'^onboard/about/?$', TemplateView.as_view(template_name='spa.html'), name='onboard-about'),
    url(r'^onboard/company/?$', TemplateView.as_view(template_name='spa.html'), name='onboard-company'),
    url(r'^onboard/employment/?$', TemplateView.as_view(template_name='spa.html'), name='onboard-employment'),
    url(r'^onboard/terms/?$', TemplateView.as_view(template_name='spa.html'), name='onboard-terms'),
    url(r'^profile/settings/payments/?$', TemplateView.as_view(template_name='spa.html'), name='payments-settings'),
    url(r'^profile/settings/billing/?$', TemplateView.as_view(template_name='spa.html'), name='billing-history'),
    url(r'^profile/settings/bank/?$', TemplateView.as_view(template_name='spa.html'), name='billing-history'),
    url(r'^profile/settings/bank/setup/?$', TemplateView.as_view(template_name='spa.html'), name='bank-setup'),
    url(r'^profile/settings/bank/setup/type/?$', TemplateView.as_view(template_name='spa.html'), name='bank-setup-type'),
    url(r'^profile/settings/bank/setup/(individual|business)/identity/?$', TemplateView.as_view(template_name='spa.html'), name='bank-setup-identity'),
    url(r'^profile/settings/bank/setup/(individual|business)/account/?$', TemplateView.as_view(template_name='spa.html'), name='bank-setup-account'),
    url(r'^profile/settings/bank/setup/(individual|business)/review/?$', TemplateView.as_view(template_name='spa.html'), name='bank-setup-review'),
    url(r'^profile/settings/bank/setup/business/company/?$', TemplateView.as_view(template_name='spa.html'), name='bank-setup-company'),
    url(r'^profile/settings/bank/setup/(individual|business)/confirmation/?$', TemplateView.as_view(template_name='spa.html'), name='bank-setup-confirmation'),
    url(r'^search/profiles/?$', TemplateView.as_view(template_name='spa.html'), name='search-profiles'),
    url(r'^notifications', TemplateView.as_view(template_name='spa.html'), name='notifications'),
    url(r'^invite-friends', TemplateView.as_view(template_name='spa.html'), name='referrals'),
    url(r'^employer', TemplateView.as_view(template_name='spa.html'), name='referrals'),
    url(r'^freelancer', TemplateView.as_view(template_name='spa.html'), name='referrals')
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)

if settings.DEBUG and settings.MEDIA_URL :
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns.append(url(r'^docs/', include('rest_framework_docs.urls')))

if settings.DEBUG :
    urlpatterns.append(url(r'^patterns/', TemplateView.as_view(template_name='spa.html'), name='patterns'))

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

handler404 = error404
handler500 = error500

