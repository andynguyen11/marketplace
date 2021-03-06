import pendulum

from celery import shared_task
from django.conf import settings
from django.core.urlresolvers import reverse
from django.db.models import Q
from django.utils.http import urlencode
from haystack.query import SearchQuerySet

from accounts.algorithm import account_analysis
from accounts.models import Profile, Role
from accounts.serializers import ProfileSearchSerializer
from business.models import Project
from generics.utils import send_mail, send_to_emails, sign_data, create_auth_token, calculate_date_ranges
from generics.tasks import queue_mail
from product.models import Order
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
def welcome_email(user_id):
    user = Profile.objects.get(id=user_id)
    email_template = 'welcome-talent' if user.roles.all() else 'welcome-employer'
    send_mail(email_template, [user], {
        'fname': user.first_name
    })

@shared_task
def profile_being_viewed(profile_id):
    profile = Profile.objects.get(id=profile_id)
    if not len(profile.work_examples.all()):
        send_mail('profile-being-viewed', [profile], {'fname': profile.first_name})

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


@celery_app.task
def recalculate_profile_scores():
    profiles = Profile.objects.filter(roles__isnull=False, long_description__isnull=False, tos=True)
    for profile in profiles:
        profile.score = account_analysis(profile)
        profile.save()


def freelancer_recommendations(profile_id):
    profile = Profile.objects.get(id=profile_id)
    projects = Project.objects.filter(project_manager=profile, status='active')

    for project in projects:
        if project.city:
            profiles = SearchQuerySet().filter(roles__in=[project.role], skills__in=project.skills.all(), city=project.city, grade__gte=70).models(Profile).order_by('-grade')
        if len(recommendations) < 6 and project.state:
            profiles = SearchQuerySet().filter(roles__in=[project.role], skills__in=project.skills.all(), state=project.state, grade__gte=70).models(Profile).order_by('-grade')
        if len(recommendations) < 6 and project.country:
            profiles = SearchQuerySet().filter(roles__in=[project.role], skills__in=project.skills.all(), country=project.country, grade__gte=70).models(Profile).order_by('-grade')
        if len(recommendations) < 6:
            profiles = SearchQuerySet().filter(roles__in=[project.role], skills__in=project.skills.all(), grade__gte=70).models(Profile).order_by('-score')
        if len(recommendations) < 6:
            return
        context = {
            'fname': profile.first_name,
            'project_title': project.title,
            'freelancers': ProfileSearchSerializer(profiles, many=True).data,
            'subscribed': True if Order.objects.filter(user=profile, status='active') else False,
            'search_url': '{0}/project/search/profiles'.format(settings.BASE_URL),
            'projects_url': '{0}/project/dashboard/projects'.format(settings.BASE_URL),
        }
        queue_mail.delay('freelancer-recommendations', profile.id, context, 'handlebars')


@celery_app.task
def freelancer_project_matching():
    end_week = pendulum.today()
    start_week = end_week.subtract(days=7)
    week_date_created = calculate_date_ranges('date_created', start_week, end_week)
    projects = Project.objects.filter(approved=True, status='active', **week_date_created).order_by('-date_created')
    if projects:
        user_list = {}
        for project in projects:
            if project.country:
                users = SearchQuerySet().filter(Q(roles__in=[project.role]) | Q(skills__in=project.skills.all()), country=project.country).models(Profile)
            else:
                users = SearchQuerySet().filter(Q(roles__in=[project.role]) | Q(skills__in=project.skills.all()))
            project = {
                'project_title': project.title,
                'fname': project.project_manager.first_name,
                'image': project.project_manager.get_photo,
                'city': project.city if project.city else project.project_manager.city,
                'state': project.state if project.state else project.project_manager.state,
                'country': project.country if project.country else project.project_manager.country,
                'description': project.scope,
                'skills': ', '.join([skill.name for skill in project.skills.all()]),
                'project_url': '{0}/project/{1}'.format(settings.BASE_URL, project.slug)
            }
            for user in users:
                if user.grade > 70:
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

