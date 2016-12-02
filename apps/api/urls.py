import tagulous

from django.conf.urls import patterns, url
from rest_framework_nested import routers
from rest_framework_jwt.views import refresh_jwt_token

from accounts.api import ProfileViewSet, ContactDetailsViewSet, SkillViewSet, SkillTestViewSet, VerificationTestViewSet
from business.api import *
from payment.api import CreditCardView, StripePaymentSourceView, OrderDetail, OrderListCreate, PromoCheck, ProductOrderViewSet
from generics.api import AttachmentViewSet
from generics.routers import DeclarativeRouter
from postman.api import ConversationDetail, MessageAPI, MessageCount
from reviews.api import ReviewListCreate
from business.models import Category
from expertratings.views import ExpertRatingsXMLWebhook, SkillTestViewSet as ERSkillTestViewSet

router = DeclarativeRouter({
    'attachment': AttachmentViewSet,
    'jobs': JobViewSet,
    'profile': {
        'view': ProfileViewSet,
        'nested': {
            'lookup': 'profile',
            'routes': {
                'skilltest': SkillTestViewSet,
            }
        }
    },
    'contactdetails': {
        'view': ContactDetailsViewSet,
        'base_name': 'contactdetails'
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
    'project': {
        'view': ProjectViewSet,
        'nested': {
            'lookup': 'project',
            'routes': {
                'job': {
                    'view': NestedJobViewSet,
                    'base_name': 'project-job',
                    'nested': {
                        'lookup': 'job',
                        'routes': {
                            'document': {
                                'view': DocumentViewSet,
                                'base_name': 'project-job-documents'
                            }
                        }
                    }
                }
            }
        }
    },
    'product': {
        'view': ProductViewSet,
        'base_name': 'product',
        'nested': {
            'lookup': '_product',
            'routes': {
                'order': ProductOrderViewSet,
            }
        }
    },
    'search/project': {
        'view': ProjectSearchView,
        'base_name': 'project-search',
    }
})

urlpatterns = [
    url(r'^jwt/$', refresh_jwt_token),
    url(r'^creditcard/$', view=CreditCardView.as_view()),
    url(r'^paymentsource/$', view=StripePaymentSourceView.as_view(), name='paymentsource'),
    url(r'^company/$', view=CompanyListCreate.as_view(), name='company'),
    url(r'^category/$', tagulous.views.autocomplete, {'tag_model': Category}, name='company-category', ),
    url(r'^company/(?P<pk>[0-9]+)/$', view=CompanyDetail.as_view(), name='company-detail'),
    url(r'^employee/$', view=EmployeeListCreate.as_view(), name='employee'),
    url(r'^employee/(?P<pk>[0-9]+)/$', view=EmployeeDetail.as_view(), name='employee-detail'),
    url(r'^message/$', view=MessageAPI.as_view(), name='send-message'),
    url(r'^message/count/$', view=MessageCount.as_view(), name='message-count'),
    url(r'^thread/(?P<thread_id>[0-9]+)/$', view=MessageAPI.as_view(), name='view-thread'),
    url(r'^messages/(?P<pk>[0-9]+)/$', view=ConversationDetail.as_view(), name='conversation-detail'),
   #url(r'^orders/$', view=OrderListCreate.as_view(), name='orders'),
   #url(r'^order/(?P<pk>[0-9]+)/$', view=OrderDetail.as_view(), name='order-detail'),
    url(r'^promo/$', view=PromoCheck.as_view(), name='promo-check'),
    url(r'^review/$', view=ReviewListCreate.as_view(), name='review'),
    url(r'^skilltest/webhook$', view=ExpertRatingsXMLWebhook.as_view(), name='skilltest-webhook'),
    url(r'^terms/$', view=TermsListCreate.as_view(), name='term'),
    url(r'^terms/agree/$', view=AgreeTerms.as_view(), name='term-agree'),
    url(r'^terms/(?P<pk>[0-9]+)/$', view=TermsRetrieveUpdate.as_view(), name='term-detail'),
] + router.urls 
