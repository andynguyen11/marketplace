import httplib

from django import http

from generics.checks import page_response, migrations_have_applied


def health(request):
    if not page_response('/'):
        return http.HttpResponse(status=httplib.SERVICE_UNAVAILABLE)
    if not migrations_have_applied():
        return http.HttpResponse(status=httplib.SERVICE_UNAVAILABLE)
    return http.HttpResponse()