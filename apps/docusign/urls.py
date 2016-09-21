from django.conf.urls import patterns, url
from rest_framework import generics

from .api import TemplateAPI, DocumentViewSet, SignerViewSet, Webhook, signing_url_redirect
from generics.routers import DeclarativeRouter

router = DeclarativeRouter({
    'document': {
    'view': DocumentViewSet, 
    'nested': {
        'lookup': 'document',
        'routes': {
            'signer': SignerViewSet,
        }
    }
}})

urlpatterns = [
    url(r'template/$', view=TemplateAPI.as_view(), name='template'),
    url(r'webhook$', view=Webhook.as_view(), name='document_webhook'),
    url(r'signing/redirect/(?P<document>[0-9]+)/$', signing_url_redirect, name='docusign_redirect')
] + router.urls 

