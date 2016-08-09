from django.shortcuts import render_to_response, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template.context import RequestContext
from django.http import HttpResponse

from postman.helpers import pm_write
from notifications.signals import notify

from business.forms import ProjectForm, InfoForm
from accounts.models import Profile

from business.models import Company, Job, Project, Employee, PROJECT_TYPES, user_company


def view_project(request, project_id=None):
    project = Project.objects.get(id=project_id)
    return render_to_response('project.html', {'project': project, }, context_instance=RequestContext(request))

def company_profile(request, company_slug=None):
    company = Company.objects.get(slug=company_slug)
    projects = Project.objects.filter(company=company)
    return render_to_response('company.html', {'company': company, 'projects': projects}, context_instance=RequestContext(request))

@login_required
def create_project(request, project_id=None):
    form = InfoForm()
    project = None
    try:
        company = user_company(request.user)
    except Employee.DoesNotExist:
        company = None
    if project_id:
        project = Project.objects.get(id=project_id)
        if project.project_manager != request.user:
            return HttpResponse(status=403)

    return render_to_response('create_project.html', {'form': form, 'project':project, 'company':company, 'project_manager': request.user}, context_instance=RequestContext(request))


@login_required
def send_message(request):
    if request.POST:
        recipient = Profile.objects.get(id=request.POST['recipient'])
        project = Project.objects.get(id=request.POST['project'])
        sender = request.user
        message = pm_write(
            sender=sender,
            recipient=recipient,
            subject='New Inquiry from {0}'.format(sender.first_name),
            body=request.POST['message'],
            project=project
        )
        return HttpResponse(status=200)
    return HttpResponse(status=403)


@login_required
def attach_docs(request):
    return NotImplemented


def projects_by_type(request, type):
    if type not in [category[0] for category in PROJECT_TYPES]:
        return redirect('404.html')
    projects = Project.objects.filter(type=type)
    count = projects.count()
    context =  {'projects': projects, 'count': count, 'title': type+' projects', }
    return render_to_response('project_by_type.html', context, context_instance=RequestContext(request))
