import tagulous

from django.conf.urls import include, patterns, url
from rest_framework_nested import routers
from rest_framework_jwt.views import refresh_jwt_token

from accounts.api import ProfileViewSet, ContactDetailsViewSet, SkillViewSet, SkillTestViewSet, VerificationTestViewSet, NotificationUpdate, ProfileSearchViewSet
from business.api import *
from payment.api import StripePaymentSourceView, PromoCheck, InvoiceViewSet, InvoiceRecipientsView, StripeConnectViewSet, StripeWebhookView, InvoicePaymentViewset
from product.api import OrderViewSet
from generics.api import AttachmentViewSet
from generics.routers import DeclarativeRouter
from postman.api import ConversationDetail, MessageAPI, MessageCount
from proposals.api import QuestionViewSet, ProposalViewSet
from reviews.api import ReviewListCreate
from expertratings.views import ExpertRatingsXMLWebhook, SkillTestViewSet as ERSkillTestViewSet


default_router = routers.DefaultRouter()
default_router.register(r'project', ProjectViewSet, base_name='project')
#default_router.register(r'questions', QuestionViewSet)

declared_router = DeclarativeRouter({
    'attachment': AttachmentViewSet,
    'contactdetails': {
        'view': ContactDetailsViewSet,
        'base_name': 'contactdetails'
    },
    'invoice': InvoiceViewSet,
    'payment': {
        'view':  InvoicePaymentViewset,
        'base_name': 'payment'
    },
    'profile': {
        'view': ProfileViewSet,
        'base_name': 'profile',
        'nested': {
            'lookup': 'profile',
            'routes': {
                'skilltest': SkillTestViewSet,
            }
        }
    },
    'order': {
        'view': OrderViewSet,
        'base_name': 'order'
    },
    'proposals': {
        'view': ProposalViewSet,
        'base_name': 'proprosals',
    },
    'search/project': {
        'view': ProjectSearchViewSet,
        'base_name': 'project-search',
    },
    'search/profile': {
        'view': ProfileSearchViewSet,
        'base_name': 'profile-search',
    },
    'skills': {
        'view': SkillViewSet,
        'nested': {
            'lookup': 'skill',
            'routes': {
                'verificationtest': VerificationTestViewSet
            }
        }
    },
    'skilltest': ERSkillTestViewSet,
    'stripe-connect': {
        'view':  StripeConnectViewSet,
        'base_name': 'stripe-connect'
    }
})

urlpatterns = [
    url(r'^jwt/$', refresh_jwt_token),
    url(r'^company/$', view=CompanyListCreate.as_view(), name='company'),
    url(r'^company/(?P<pk>[0-9]+)/$', view=CompanyDetail.as_view(), name='company-detail'),
    url(r'^employee/$', view=EmployeeListCreate.as_view(), name='employee'),
    url(r'^employee/(?P<pk>[0-9]+)/$', view=EmployeeDetail.as_view(), name='employee-detail'),
    url(r'^invoice/recipients/$', view=InvoiceRecipientsView.as_view(), name='invoice-recipients'),
    url(r'^message/$', view=MessageAPI.as_view(), name='send-message'),
    url(r'^message/count/$', view=MessageCount.as_view(), name='message-count'),
    url(r'^nda/(?P<pk>[0-9]+)/$', view=NDAUpdate.as_view(), name='nda-update'),
    url(r'^notifications/(?P<pk>[0-9]+)/$', view=NotificationUpdate.as_view(), name='notification-update'),
    url(r'^paymentsource/$', view=StripePaymentSourceView.as_view(), name='paymentsource'),
    url(r'^questions/$', view=QuestionViewSet.as_view({
        'post': 'create',
        'patch': 'partial_update'
    }), name='questions'),
    url(r'^thread/(?P<thread_id>[0-9]+|find)/$', view=MessageAPI.as_view(), name='view-thread'),
    url(r'^messages/(?P<pk>[0-9]+)/$', view=ConversationDetail.as_view(), name='conversation-detail'),
    url(r'^promo/$', view=PromoCheck.as_view(), name='promo-check'),
    url(r'^review/$', view=ReviewListCreate.as_view(), name='review'),
    url(r'^search/skills/', view=skills_autocomplete, name='autocomplete'),
    url(r'^skilltest/webhook$', view=ExpertRatingsXMLWebhook.as_view(), name='skilltest-webhook'),
    url(r'^stripe/webhook/$', view=StripeWebhookView.as_view(), name='stripe-webhook'),
    url(r'^', include(default_router.urls)),
    url(r'^', include(declared_router.urls)),
]
