from django.conf.urls import patterns, url
from rest_framework import generics

from .api_views import TemplateAPI, DocumentAPI, SignerAPI, Webhook

urlpatterns = patterns(
    'apps.docusign',
    url(r'template/$', view=TemplateAPI.as_view(), name='template'),
    url(r'document/$', view=DocumentAPI.as_view(), name='document'),
    url(r'document/signer$', view=SignerAPI.as_view(), name='document_signer'),
    url(r'webhook$', view=Webhook.as_view(), name='document_webhook'),
)
