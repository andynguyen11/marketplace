import tagulous

from django.conf.urls import patterns, url
from rest_framework_nested import routers
from generics.routers import DeclarativeRouter

from accounts.api import ProfileViewSet, SkillsList, SkillTestViewSet
from business.api import *
from payment.api import CreditCardView, PaymentView, OrderDetail, OrderListCreate
from postman.api import ConversationDetail
from reviews.api import ReviewListCreate
from business.models import Category
from expertratings.views import ExpertRatingsXMLWebhook

router = DeclarativeRouter({
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
    'project': {
        'view': ProjectViewSet,
        'nested': {
            'lookup': 'project',
            'routes': {
                'info': {
                    'view': InfoViewSet,
                    'base_name': 'project-info'
                },
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
    'search/project': {
        'view': ProjectSearchView,
        'base_name': 'project-search',
    }
})

urlpatterns = [
    url(r'skills/$', view=SkillsList.as_view(), name='skills', ),
    url(r'creditcard/$', view=CreditCardView.as_view()),
    url(r'^company/$', view=CompanyListCreate.as_view(), name='company'),
    url(r'^category/$', tagulous.views.autocomplete, {'tag_model': Category}, name='company-category', ),
    url(r'^company/(?P<pk>[0-9]+)/$', view=CompanyDetail.as_view(), name='company-detail'),
    url(r'^messages/(?P<pk>[0-9]+)/$', view=ConversationDetail.as_view(), name='conversation-detail'),
    url(r'^orders/$', view=OrderListCreate.as_view(), name='orders'),
    url(r'^order/(?P<pk>[0-9]+)/$', view=OrderDetail.as_view(), name='order-detail'),
    url(r'^review/$', view=ReviewListCreate.as_view(), name='review'),
    url(r'^skilltest/webhook$', view=ExpertRatingsXMLWebhook.as_view(), name='skilltest-webhook'),
    url(r'^terms/$', view=TermsListCreate.as_view(), name='term'),
    url(r'^terms/(?P<pk>[0-9]+)/$', view=TermsRetrieveUpdate.as_view(), name='term-detail'),
] + router.urls 
