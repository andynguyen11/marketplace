from django.shortcuts import render_to_response, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template.context import RequestContext
from django.http import HttpResponse

from postman.api import pm_write

from business.forms import ProjectForm
from accounts.models import Profile
from business.models import Project, Job, Company


def view_project(request, project_id=None):
    project = Project.objects.get(id=project_id)
    return render_to_response('project.html', {'project': project, }, context_instance=RequestContext(request))


@login_required
def create_project(request):
    form = ProjectForm()
    if request.POST:
        form = ProjectForm(request.POST, request.FILES)
        if form.is_valid():
            company = Company.objects.get(primary_contact=request.user)
            new_project = Project(
                company=company,
                project_manager=request.user,
                title=request.POST['title'],
                type=request.POST['type'],
                image=request.FILES['image'],
                short_blurb=request.POST['short_blurb'],
                description=request.POST['description'],
                category=request.POST['category'],
                secondary_category=request.POST['secondary_category'],
                location=request.POST['location'],
                estimated_equity=request.POST['estimated_equity'],
                estimated_cash=request.POST['estimated_cash'],
                estimated_hours=request.POST['estimated_hours'],
                skills=request.POST['skills'],
                status='pending',
            )
            new_project.save()
            return redirect('view-bids')
    return render_to_response('create_project.html', {'form': form}, context_instance=RequestContext(request))


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


@login_required
def attach_docs(request):
    return NotImplemented


def art_design_projects(request):
    projects = Project.objects.filter(type='art')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/art.html', context, context_instance=RequestContext(request))


def gaming_projects(request):
    projects = Project.objects.filter(type='gaming')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/gaming.html', context, context_instance=RequestContext(request))


def health_projects(request):
    projects = Project.objects.filter(type='health')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/health.html', context, context_instance=RequestContext(request))


def location_based_projects(request):
    projects = Project.objects.filter(type='location')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/location.html', context, context_instance=RequestContext(request))


def music_and_media_projects(request):
    projects = Project.objects.filter(type='music')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/music.html', context, context_instance=RequestContext(request))


def news_and_publishing_projects(request):
    projects = Project.objects.filter(type='news')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/news.html', context, context_instance=RequestContext(request))


def non_profit_projects(request):
    projects = Project.objects.filter(type='nonprofit')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/nonprofit.html', context, context_instance=RequestContext(request))


def social_projects(request):
    projects = Project.objects.filter(type='social')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/social.html', context, context_instance=RequestContext(request))


def technology_projects(request):
    projects = Project.objects.filter(type='technology')
    count = projects.count()
    context = {'projects': projects, 'count': count}
    return render_to_response('projects_gallery/technology.html', context, context_instance=RequestContext(request))

