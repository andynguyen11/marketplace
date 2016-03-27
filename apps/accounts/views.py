from django.shortcuts import render_to_response, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template.context import RequestContext


def login(request):
    return render_to_response('login.html', context=RequestContext(request))


def home(request):
    return render_to_response('home.html')


def logout(request):
    auth_logout(request)
    return redirect('/')

@login_required
def edit_developer_profile(request):
    user = request.user
    social = user.social_auth.get(provider='linkedin-oauth2')
    return render_to_response('edit-profile.html', {'user': user, 'social': social}, context_instance=RequestContext(request))


def developer_profile(request, user_id=None):
    if user_id:
        user = Profile.objects.get(id=user_id)
    else:
        user = request.user
    social = user.social_auth.get(provider='linkedin-oauth2')
    return render_to_response('profile.html', {'user': user, 'social': social}, context_instance=RequestContext(request))


def save_social_profile(backend, user, response, *args, **kwargs):
    if backend.name == 'linkedin-oauth2':
        print(response, user)