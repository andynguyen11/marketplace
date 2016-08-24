from django.shortcuts import render_to_response, redirect, render
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template.context import RequestContext
from django.http import HttpResponse

from postman.helpers import pm_write
from notifications.signals import notify

from business.forms import ProjectForm, InfoForm
from business.serializers import ProjectSerializer
from accounts.models import Profile

from business.models import Company, Job, Project, Employee, PROJECT_TYPES, user_company


def view_project(request, project_slug):
    project = Project.objects.get(slug=project_slug)
    return render_to_response('project.html', {'project': project, }, context_instance=RequestContext(request))

def company_profile(request, company_slug=None):
    company = Company.objects.get(slug=company_slug)
    projects = Project.objects.filter(company=company)
    return render_to_response('company.html', {'company': company, 'projects': projects}, context_instance=RequestContext(request))

def delete_project(request, project_id):
    project = Project.objects.get(id=project_id)
    if project.project_manager != request.user:
        return HttpResponse(status=403)
    project.delete = True
    project.save()
    return redirect('view-bids')

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

    return render_to_response('create_project.html', {
            'project': ProjectSerializer(project).data,
            'form': form, 'company': company, 'project_manager': request.user
        }, context_instance=RequestContext(request))


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

def project_groups(**kwargs):
    new = Project.objects.filter(**kwargs).order_by('-date_created')[:9]
    try:
        featured = Project.objects.filter(featured=1, **kwargs)[:3]
    except Project.DoesNotExist, e:
        featured = new[0]
    return dict(new=new, featured=featured, categories=PROJECT_TYPES, **kwargs)

def serialized_project_groups(**kwargs):
    groups = project_groups(**kwargs)
    for key in ['new', 'featured']:
        groups[key] = [ProjectSerializer(project).data for project in groups[key]]
    return groups

def projects_by_type(request, type=None):
    kwargs = {'type': type} if type in [category[0] for category in PROJECT_TYPES] else {}
    return render(request, 'project_by_type.html', serialized_project_groups(**kwargs))

def discover_projects(request, type=None):
    # create list of projects types that exist.
    project_types = []
    for item in PROJECT_TYPES:
        if Project.objects.filter(type=item[0]):
            project_types.append(item)

    all = Project.objects.all()
    new = all.filter(type=type).order_by('-date_created')
    featured = all.filter(type=type, featured=1)
    return render(request, 'project_by_type.html', {
        'all': all,
        'featured': featured,
        'new': new,
        'type': type,
        'project_types': project_types,
    })
