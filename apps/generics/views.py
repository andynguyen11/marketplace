import httplib

from django import http

from generics.checks import page_response, migrations_have_applied


def health(request):
    if not page_response('/'):
        print('hi')
        return http.HttpResponse(status=httplib.SERVICE_UNAVAILABLE)
    if not migrations_have_applied():
        print('bye')
        return http.HttpResponse(status=httplib.SERVICE_UNAVAILABLE)
    return http.HttpResponse()