import logging

from django.shortcuts import render_to_response, render

logger = logging.getLogger(__name__)


def error404(request):
    response = render_to_response('404.html', {}, context_instance=RequestContext(request))
    response.status_code = 404
    return response


def error500(request):
    return render(request, '500.html')