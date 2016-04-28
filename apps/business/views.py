from django.shortcuts import render_to_response, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template.context import RequestContext
from django.http import HttpResponse

from postman.api import pm_write

from accounts.models import Profile
from business.models import Project, Job


def view_project(request, project_id=None):
    project = Project.objects.get(id=project_id)
    return render_to_response('project.html', {'project': project, }, context_instance=RequestContext(request))


def create_project(request):
    return render_to_response('create_project.html', {}, context_instance=RequestContext(request))


@login_required
def send_message(request):
    if request.POST:
        recipient = Profile.objects.get(id=request.POST['recipient'])
        sender = request.user
        message = pm_write(
            sender=sender,
            recipient=recipient,
            subject='New Inquiry from {0}'.format(sender.first_name),
            body=request.POST['message'])
        return HttpResponse(status=200)
    return HttpResponse(status=403)


@login_required
def send_bid(request):
    if request.POST:
        recipient = Profile.objects.get(id=request.POST['recipient'])
        sender = request.user
        project = Project.objects.get(id=request.POST['project_id'])
        message = pm_write(
            sender=sender,
            recipient=recipient,
            subject='New Bid from {0} for {1}'.format(sender.first_name, project.title),
            body=request.POST['message'])
        job = Job.objects.create(
            project=project,
            developer=sender,
            equity=request.POST['equity'],
            cash=request.POST['cash'],
            hours=request.POST['hours'],
            message=message.id)
        return HttpResponse(status=200)
    return HttpResponse(status=403)
