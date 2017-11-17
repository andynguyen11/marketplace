import pendulum

from celery import shared_task
from django.conf import settings
from django.core.urlresolvers import reverse
from django.utils.http import urlencode
from haystack.query import SearchQuerySet

from accounts.models import Profile, Role
from business.models import Project
from generics.utils import send_mail, send_to_emails, sign_data, create_auth_token, calculate_date_ranges
from generics.tasks import queue_mail
from market.celery import app as celery_app


def generate_confirmation_signature(user, instance, field):
    return sign_data(user_id=user.id, id=instance.id, field=field, value=getattr(instance, field))

def absolute_url(url, query):
    base_url = settings.BASE_URL if settings.BASE_URL.startswith('http') else (
            ('http://' if settings.DEBUG else 'https://') + settings.BASE_URL)
    return '%s%s?%s' % (base_url, url, urlencode(query))

def generate_confirmation_url(user, instance, field,
        base_name=None, reverse_pattern='api:%s-confirm-email', **kwargs):
    if not base_name:
        base_name = instance._meta.model_name
    kwargs['signature'] = generate_confirmation_signature(user, instance, field=field)
    kwargs['token'] = create_auth_token(user)
    url = reverse(reverse_pattern % base_name, args=(instance.id,))
    return absolute_url(url, kwargs)

@shared_task
def send_email_confirmation(template, email, context):
    send_to_emails(template, emails=[email], context=context)

def email_confirmation(user, instance=None, email_field='email', template='verify-email'):
    if not instance:
        instance = user
    send_email_confirmation.delay(template, email=getattr(instance, email_field), context={
        'fname': user.first_name,
        'url': generate_confirmation_url(user, instance, field=email_field)
    })

@shared_task
def account_confirmation(user_id, roles=True):
    user = Profile.objects.get(id=user_id)
    email_template = 'welcome-developer' if roles else 'welcome-entrepreneur'
    send_mail(email_template, [user], {
        'fname': user.first_name,
        'email': user.email
    })

@shared_task
def profile_being_viewed(profile_id):
    profile = Profile.objects.get(id=profile_id)
    if not profile.work_examples:
        send_mail('profile-being-viewed', [profile], {})

@shared_task
def password_updated(user_id):
    user = Profile.objects.get(id=user_id)
    send_mail('password-updated', [user], context={})

@shared_task
def project_invite(sender_id, recipient_id):
    recipient = Profile.objects.get(id=recipient_id)
    sender = Profile.objects.get(id=sender_id)
    projects = Project.objects.filter(project_manager=sender, status='active')
    discipline_list = [role.category for role in recipient.roles.all()]
    if not discipline_list:
        return False
    project_list = [project for project in projects if project.category in discipline_list]
    if not project_list:
        project_list = [project for project in projects]
    context = {
        'talent': recipient.first_name,
        'employer': sender.name,
        'projects': []
    }
    for project in project_list:
        skills = [skill.name for skill in project.skills.all()]
        project = {
                'project_title': project.title,
                'description': project.scope,
                'skills': ', '.join(skills),
                'project_url': '{0}/project/{1}'.format(settings.BASE_URL, project.slug)
            }
        context['projects'].append(project)
    template = 'project-invite' if len(project_list) == 1 else 'projects-invite'
    queue_mail.delay(template, recipient.pk, context, 'handlebars')


def freelancer_recommendations():
    recommendations = SearchQuerySet().filter(**week_date_created).models(Profile)


@celery_app.task
def freelancer_project_matching():
    end_week = pendulum.today()
    start_week = end_week.subtract(days=7)
    week_date_created = calculate_date_ranges('date_created', start_week, end_week)
    projects = SearchQuerySet().filter(**week_date_created).models(Project).order_by('-date_created')
    if projects:
        user_list = {}
        for project in projects:
            users = SearchQuerySet().filter(roles__in=[project.role], skills__in=project.skills).models(Profile)#Profile.objects.filter(roles__name__in=[project.role])
            project = {
                'project_title': project.title,
                'fname': project.first_name,
                'image': project.photo,
                'city': project.city,
                'state': project.state,
                'country': project.country,
                'description': project.scope,
                'skills': ', '.join(project.skills),
                'project_url': '{0}/project/{1}'.format(settings.BASE_URL, project.slug)
            }
            for user in users:
                if user.email not in user_list.keys():
                    user_list[user.email] = {}
                    user_list[user.email]['user'] = user
                    user_list[user.email]['projects'] = [project, ]
                else:
                    user_list[user.email]['projects'].append(project)

        for key, value in user_list.items():
            context={
                'fname': value['user'].first_name,
                'projects': value['projects']
            }
            queue_mail.delay('project-matching', value['user'].pk, context, 'handlebars')