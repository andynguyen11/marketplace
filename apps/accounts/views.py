from django.shortcuts import render_to_response, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template.context import RequestContext

from apps.accounts.models import Profile
from apps.business.models import Project


def login(request):
    return render_to_response('login.html', context=RequestContext(request))


def home(request):
    featured = Project.objects.filter(featured=1)[:1].get()
    new_projects = Project.objects.all()[:3].get()
    developers = Profile.objects.all()[:3].get()
    return render_to_response('home.html', {'featured': featured, 'new_projects': new_projects, 'developers': developers}, context_instance=RequestContext(request))


def logout(request):
    auth_logout(request)
    return redirect('/')

@login_required
def edit_profile(request):
    user = request.user
    social = user.social_auth.get(provider='linkedin-oauth2')
    return render_to_response('edit-profile.html', {'user': user, 'social': social}, context_instance=RequestContext(request))


def view_profile(request, user_id=None):
    if user_id:
        user = Profile.objects.get(id=user_id)
    else:
        user = request.user
    social = user.social_auth.get(provider='linkedin-oauth2')
    return render_to_response('profile.html', {'user': user, 'social': social}, context_instance=RequestContext(request))


def save_social_profile(backend, user, response, *args, **kwargs):
    if backend.name == 'linkedin-oauth2':
        print(response, user)