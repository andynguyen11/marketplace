from django.shortcuts import render_to_response, redirect, render
from django.contrib.auth import logout as auth_logout, authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from accounts.decorators import email_confirmation_required
from django.http import HttpResponseRedirect, HttpResponse
from django.template.context import RequestContext
from django.views.decorators.cache import cache_page
from django.utils.datastructures import MultiValueDictKeyError
from generics.viewsets import assign_crud_permissions

from postman.models import Message
from accounts.forms import LoginForm
from accounts.models import Profile
from business.models import Project, Job, Terms, PROJECT_TYPES
from apps.api.utils import set_jwt_token


def project_groups(**kwargs):
    new = Project.objects.filter(published=True, approved=True, **kwargs).order_by('-date_created')[:3]
    try:
        featured = Project.objects.filter(featured=1, published=True, approved=True, **kwargs)[:3]
    except Project.DoesNotExist, e:
        featured = new[0]
    return dict(new=new, featured=featured, categories=PROJECT_TYPES, **kwargs)

def error404(request):
    return render(request, '404.html')

def error500(request):
    return render(request, '500.html')

def user_login(request):
    form = LoginForm()
    next = request.GET.get('next', 'dashboard')
    if request.method == 'POST':
        form = LoginForm(request.POST or None)
        if form.is_valid():
            account = authenticate(username=form.cleaned_data['email'], password=form.cleaned_data['password'])
            if account is not None:
                if account.is_active:
                    login(request, account)
                    response = redirect(next)
                    response = set_jwt_token(response, account)
                    return response
            else:
                form.add_error(None, 'Your email or password is incorrect.')
    return render(request, 'login.html', {'form': form, 'next': next})

def psa_redirect(request):
    """
    Hijacks the Python Social Auth redirect to set the JWT
    """
    if request.user.tos:
        next = request.GET.get('next', 'profile/dashboard')
        response = redirect(next)
    else:
        response = redirect('onboard-entry')
    response = set_jwt_token(response, request.user)
    return response

def home(request):
    context = project_groups()
    context['developers'] = Profile.objects.filter(featured=1)
    return render_to_response('home.html', context, context_instance=RequestContext(request))

def logout(request):
    response = redirect('/')
    response.delete_cookie('loom_token')
    auth_logout(request)
    return response

@login_required
@email_confirmation_required
def dashboard(request):
    user = Profile.objects.get(id=request.user.id)
    social = user.social_auth.filter(provider='linkedin-oauth2')
    notifications = user.notifications.unread()
    messages = Message.objects.inbox(request.user, {'is_new': True, })[:5]
    return render_to_response('dashboard.html', {'user': user, 'social': social, 'notifications': notifications, 'messages': messages, }, context_instance=RequestContext(request))

  
@staff_member_required
def discover_developers(request, role=None):
    all = Profile.objects.exclude(roles=None)
    if role != 'all':
        developers = all.filter(roles__name=role)
        featured = all.filter(roles__name=role, featured=1)[:3]
    else:
        developers = all
        featured = all.filter(featured=1)[:3]
        role = 'all'
    roles = []
    return render(request, 'discover-developers.html', {
        'developers': developers,
        'all': all,
        'featured': featured,
        'role': role,
    })