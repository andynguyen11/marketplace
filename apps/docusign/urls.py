from django.conf.urls import patterns, url
from rest_framework import generics

from .api_views import TemplateAPI, DocumentAPI, SignerAPI, Webhook, signing_url_redirect

urlpatterns = [
    url(r'template/$', view=TemplateAPI.as_view(), name='template'),
    url(r'document/$', view=DocumentAPI.as_view(), name='document'),
    url(r'document/signer$', view=SignerAPI.as_view(), name='document_signer'),
    url(r'webhook$', view=Webhook.as_view(), name='document_webhook'),
    url(r'signing/redirect/(?P<document>[0-9]+)/$', signing_url_redirect, name='docusign_redirect')
]
