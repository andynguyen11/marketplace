from django.shortcuts import render_to_response, redirect, render
from django.contrib.auth import logout as auth_logout, authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.template.context import RequestContext
from django.utils.datastructures import MultiValueDictKeyError

from postman.models import Message
from accounts.forms import ProfileForm, LoginForm, DeveloperOnboardForm, ManagerOnboardForm
from accounts.models import Profile
from business.models import Project, Job, PROJECT_TYPES


def error404(request):
    return render(request, '404.html')


def error500(request):
    return render(request, '500.html')


def user_login(request):
    form = LoginForm()
    if request.method == 'POST':
        form = LoginForm(request.POST or None)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            user.set_password(password)
            user.save()
            account = authenticate(username=user.username, password=password)
            login(request, account)
            return redirect('confirm-profile')
    return render(request, 'login.html', {'form': form})


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
def developer_onboard(request, template):
    form = DeveloperOnboardForm()
    if request.method == 'POST':
        form = DeveloperOnboardForm(request.POST, request.FILES)
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
    return render_to_response(template, {'form': form , }, context_instance=RequestContext(request))\


@login_required
def manager_onboard(request, template):
    form = ManagerOnboardForm()
    if request.method == 'POST':
        form = ManagerOnboardForm(request.POST, request.FILES)
        if form.is_valid():
            request.user.first_name = form.cleaned_data['first_name']
            request.user.last_name = form.cleaned_data['last_name']
            request.user.title = form.cleaned_data['title']
            request.user.biography = form.cleaned_data['biography']
            request.user.city = form.cleaned_data['city']
            request.user.state = form.cleaned_data['state']
            try:
                request.user.photo = request.FILES['image']
            except MultiValueDictKeyError:
                pass
            request.user.save()
            return redirect('dashboard')
        return render_to_response(template, {'form': form, }, context_instance=RequestContext(request))
    return render_to_response(template, {'form': form, }, context_instance=RequestContext(request))


@login_required
def edit_profile(request):
    user = request.user
    social = user.social_auth.get(provider='linkedin-oauth2')
    return render_to_response('edit-profile.html', {'user': user, 'social': social, }, context_instance=RequestContext(request))


@login_required
def dashboard(request):
    user = Profile.objects.get(id=request.user.id)
    social = user.social_auth.filter(provider='linkedin-oauth2')
    notifications = user.notifications.unread()
    messages = Message.objects.inbox(request.user, {'is_new': True, })[:5]
    return render_to_response('dashboard.html', {'user': user, 'social': social, 'notifications': notifications, 'messages': messages, }, context_instance=RequestContext(request))


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
    form = ProfileForm()
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES)
        if form.is_valid():
            request.user.first_name = form.cleaned_data['first_name']
            request.user.last_name = form.cleaned_data['last_name']
            request.user.capacity = form.cleaned_data['capacity']
            request.user.location = form.cleaned_data['location']
            request.user.biography = form.cleaned_data['biography']
            try:
                request.user.photo = request.FILES['photo']
            except MultiValueDictKeyError:
                pass

            request.user.save()
            return redirect('profile-settings')
        return render_to_response(template, {'form': form, }, context_instance=RequestContext(request))
    return render_to_response(template, {'form': form, }, context_instance=RequestContext(request))