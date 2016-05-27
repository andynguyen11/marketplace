from django.shortcuts import render_to_response, redirect, render
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.template.context import RequestContext
from django.utils.datastructures import MultiValueDictKeyError



from .forms import ProfileForm
from accounts.models import Profile
from business.models import Project, Job, PROJECT_TYPES


def error404(request):
    return render(request, '404.html')


def error500(request):
    return render(request, '500.html')


def login(request):
    return render_to_response('login.html', context=RequestContext(request))


def home(request):
    featured = Project.objects.filter(featured=1)[:1].get()
    new = Project.objects.all().order_by('-date_created')[:3]
    developers = Profile.objects.all().order_by('-date_joined')[:3]
    return render_to_response('home.html',
        {'featured': featured, 'new': new, 'developers': developers, 'categories': PROJECT_TYPES, },
        context_instance=RequestContext(request))


def logout(request):
    auth_logout(request)
    return redirect('/')


def view_profile(request, user_id=None):
    if user_id:
        user = Profile.objects.get(id=user_id)
    else:
        user = request.user
    jobs = Job.objects.filter(developer=user)
    social = user.social_auth.get(provider='linkedin-oauth2')
    return render_to_response('profile.html', {'user': user, 'social': social, 'jobs': jobs, }, context_instance=RequestContext(request))


@login_required
def confirm_profile(request, template):
    return render_to_response(template, {}, context_instance=RequestContext(request))


@login_required
def developer_onboard(request, template):
    form = ProfileForm()
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES)
        if form.is_valid():
            request.user.role = form.cleaned_data['role']
            request.user.biography = form.cleaned_data['biography']
            try:
                request.user.photo = request.FILES['image']
            except MultiValueDictKeyError:
                pass
            request.user.capacity = form.cleaned_data['capacity']
            request.user.skills = form.cleaned_data['skills']
            request.user.save()
            return redirect('dashboard')
        return render_to_response(template, {'form': form, }, context_instance=RequestContext(request))
    return render_to_response(template, {'form': form , }, context_instance=RequestContext(request))


@login_required
def edit_profile(request):
    user = request.user
    social = user.social_auth.get(provider='linkedin-oauth2')
    return render_to_response('edit-profile.html', {'user': user, 'social': social, }, context_instance=RequestContext(request))


@login_required
def dashboard(request):
    user = Profile.objects.get(id=request.user.id)
    social = user.social_auth.get(provider='linkedin-oauth2')
    notifications = user.notifications.unread()
    return render_to_response('dashboard.html', {'user': user, 'social': social, 'notifications': notifications, }, context_instance=RequestContext(request))


@login_required
def view_bids(request):
    projects = Project.objects.filter(project_manager=request.user)
    return render_to_response('bids.html', {'projects': projects, }, context_instance=RequestContext(request))


@login_required
def view_projects(request):
    projects = Project.objects.filter(project_manager=request.user)
    return render_to_response('projects.html', {'projects': projects, }, context_instance=RequestContext(request))


@login_required
def view_documents(request):
    projects = Project.objects.filter(project_manager=request.user)
    return render_to_response('documents.html', {'projects': projects, }, context_instance=RequestContext(request))

@login_required
def profile(request, template='account-settings.html'):
    return render_to_response(template, {}, context_instance=RequestContext(request))