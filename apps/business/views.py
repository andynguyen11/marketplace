from django.shortcuts import render_to_response, redirect, render
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template.context import RequestContext
from django.views.decorators.cache import cache_page
from django.http import HttpResponse

from postman.helpers import pm_write
from notifications.signals import notify

from business.forms import ProjectForm, InfoForm
from business.serializers import ProjectSerializer
from accounts.models import Profile

from business.models import Company, Job, Project, Employee, PROJECT_TYPES, user_company


def view_project(request, project_slug):
    try:
        project = Project.objects.get(slug=project_slug)
    except Project.DoesNotExist:
        return redirect('project-gallery')
    job = None
    try:
        if request.user.is_authenticated():
            job = Job.objects.get(project=project, contractor=request.user)
    except Job.DoesNotExist:
        pass
    if project.approved or request.user == project.project_manager or request.user.is_staff:
        return render_to_response('project.html', {'project': project, 'job': job }, context_instance=RequestContext(request))
    else:
        return redirect('project-gallery')

def company_profile(request, company_slug=None):
    company = Company.objects.get(slug=company_slug)
    projects = Project.objects.filter(company=company)
    return render_to_response('company.html', {'company': company, 'projects': projects}, context_instance=RequestContext(request))

def delete_project(request, project_id):
    project = Project.objects.get(id=project_id)
    if project.project_manager != request.user:
        return HttpResponse(status=403)
    project.deleted = True
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
def attach_docs(request):
    return NotImplemented

def project_groups(**kwargs):
    new = Project.objects.filter(published=True, approved=True, **kwargs).order_by('-date_created')[:3]
    try:
        featured = Project.objects.filter(featured=1, published=True, approved=True, **kwargs)[:3]
    except Project.DoesNotExist, e:
        featured = new[0]
    return dict(new=new, featured=featured, categories=PROJECT_TYPES, **kwargs)

def serialized_project_groups(**kwargs):
    groups = project_groups(**kwargs)
    for key in ['new', 'featured']:
        groups[key] = [ProjectSerializer(project).data for project in groups[key]]
    return groups

def projects_by_type(request, type='all'):
    kwargs = {'type': type} if type in [category[0] for category in PROJECT_TYPES] else {}
    return render(request, 'project_by_type.html', serialized_project_groups(**kwargs))

@login_required(login_url='/signup/')
def discover_projects(request, type='all'):
    # create list of projects types that exist.
    project_types = []
    for item in PROJECT_TYPES:
        if Project.objects.filter(type=item[0], published=True, approved=True):
            project_types.append(item)

    if type != 'all':
        i = [y[0] for y in PROJECT_TYPES].index(type)
        cat_name = PROJECT_TYPES[i][1]
    else:
        cat_name = 'all'

    all = Project.objects.filter(published=True, approved=True)
    new = all.filter(type=type).order_by('-date_created')
    featured = all.filter(type=type, featured=1)[:3]
    return render(request, 'project_by_type.html', {
        'all': all,
        'featured': featured,
        'new': new,
        'cat_name': cat_name,
        'type': type,
        'project_types': project_types,
    })
