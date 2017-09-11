import simplejson
from datetime import datetime, timedelta

from celery import shared_task
from django.conf import settings

from accounts.models import Profile
from business.models import Project
from generics.utils import send_mail
from market.celery import app as celery_app


@celery_app.task
def refresh_projects():
    #TODO optimize by queuing up deactivation as a task
    # Send renew email
    # Send deactivate email
    today = datetime.day.today()
    projects = Project.objects.filter(published=True, approved=True, expire_date__lt=today)
    for project in projects:
        if project.autorenew:
            project.activate()
        else:
            project.deactivate()

@shared_task
def project_in_review(project_id):
    project = Project.objects.get(id=project_id)
    send_mail('project-in-review', [project.project_manager], {})

@shared_task
def project_posted(project_id):
    """
    Dispatches project posted notification to admin
    Creates preauth charge for project posting

    :param project_id:

    """
    project = Project.objects.get(id=project_id)
    project.preauth()
    admin = Profile.objects.get(username='admin')
    send_mail('project-posted', [admin], {
        'project': project.title,
        'date': simplejson.dumps(datetime.now().isoformat()),
        'entrepreneur': project.project_manager.name,
        'email': project.project_manager.email,
        'url': '{0}/project/{1}/'.format(settings.BASE_URL, project.slug),
    })

@shared_task
def post_a_project(profile_id):
    user = Profile.objects.get(id=profile_id)
    project = Project.objects.filter(project_manager=user)
    if not len(project):
        send_mail('post-a-project', [user], {})


@shared_task
def complete_project(project_id):
    project = Project.objects.get(id=project_id)
    if not project.published and not project.deleted:
        send_mail('complete-project', [project.project_manager], {
            'url': '{0}/project/{1}/'.format(settings.BASE_URL, project.slug),
        })

@shared_task
def project_approved_email(project_id):
    project = Project.objects.get(id=project_id)
    project.activate()
    send_mail('project-approved', [project.project_manager], {
        'fname': project.project_manager.first_name,
        'url': '{0}/project/{1}/'.format(settings.BASE_URL, project.slug),
    })