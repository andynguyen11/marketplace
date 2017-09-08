from datetime import datetime, timedelta

from business.models import Project
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