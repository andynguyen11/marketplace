from django.conf.urls import patterns, url

from apps.api.payments import BillingView


urlpatterns = patterns(
    'apps.api',
    url(r'billing/$', view=BillingView.as_view()),
)