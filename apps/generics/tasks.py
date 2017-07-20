from __future__ import absolute_import, division
from datetime import datetime, timedelta
import pendulum
import pytz
import simplejson

from celery import shared_task
from celery.schedules import crontab
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.db.models import Avg, Q
from django.utils.http import urlencode
from rest_framework.exceptions import ValidationError, PermissionDenied

from market.celery import app as celery_app
from accounts.models import Profile
from business.models import Document, Project, Employee, NDA
from expertratings.models import SkillTestResult
from generics.models import Attachment
from generics.utils import send_mail, send_to_emails, sign_data, parse_signature, create_auth_token
from proposals.models import Proposal
from postman.models import Message

utc=pytz.UTC


def validate_confirmation_signature(instance, signature, confirm_on_success='%s_confirmed'):
    """
    validates tokens generated with generate_confirmation_signature.
    sets '%(field)s_confirmed' = True by default, can be disabled with confirm_on_success=False
    """
    token_data = parse_signature(signature)
    if(token_data['id'] != instance.id):
        raise PermissionDenied(detail='signature used on incorrect instance')
    if(token_data['value'] != getattr(instance, token_data['field'])):
        raise ValidationError(detail={'signature': ['instance field value no longer matches signed field value']})
    if(confirm_on_success):
        setattr(instance, confirm_on_success % token_data['field'], True)
        instance.save()
    return token_data


@shared_task
def account_confirmation(user_id, roles=True):
    user = Profile.objects.get(id=user_id)
    email_template = 'welcome-developer' if roles else 'welcome-entrepreneur'
    send_mail(email_template, [user], {
        'fname': user.first_name,
        'email': user.email
    })

@shared_task
def new_message_notification(recipient_id, thread_id):
    recipient = Profile.objects.get(id=recipient_id)
    unread_messages = Message.objects.filter(
        recipient = recipient_id,
        thread = thread_id,
        read_at__isnull = True
    ).order_by('-sent_at')
    thread = Message.objects.get(
        id = thread_id
    )
    email_threshold = datetime.now() - timedelta(hours=6)
    last_emailed = thread.last_emailed_bidder if recipient_id == thread.sender.id else thread.last_emailed_owner
    last_emailed = last_emailed if last_emailed else utc.localize(datetime.now() - timedelta(hours=7))
    if unread_messages.count() >= 1 and last_emailed < utc.localize(email_threshold):
        proposal = Proposal.objects.get(message=thread)
        send_mail('message-received', [recipient], {
            'projectname': proposal.project.title,
            'email': recipient.email
        })
        if recipient_id == thread.sender.id:
            thread.last_emailed_bidder = datetime.now()
        else:
            thread.last_emailed_owner = datetime.now()
        thread.save()

@shared_task
def nda_sent_email(nda_id):
    nda = NDA.objects.get(id=nda_id)
    merge_vars = {
        'fname': nda.sender.name,
        'project': nda.proposal.project.title,
        'thread': nda.proposal.message.id,
    }
    send_mail('nda-sent', [nda.receiver], merge_vars)

@shared_task
def nda_signed_entrepreneur_email(nda_id):
    nda = NDA.objects.get(id=nda_id)
    merge_vars = {
        'fname': nda.receiver.name,
        'project': nda.proposal.project.title
    }
    send_mail('nda-signed-entrepreneur', [nda.sender], merge_vars)

@shared_task
def nda_signed_freelancer_email(nda_id):
    nda = NDA.objects.get(id=nda_id)
    merge_vars = {
        'fname': nda.sender.name,
        'project': nda.proposal.project.title
    }
    send_mail('nda-signed-freelancer', [nda.receiver], merge_vars)

@shared_task
def project_in_review(project_id):
    project = Project.objects.get(id=project_id)
    send_mail('project-in-review', [project.project_manager], {})


@shared_task
def project_posted(project_id):
    project = Project.objects.get(id=project_id)
    admin = Profile.objects.get(username='admin')
    send_mail('project-posted', [admin], {
        'project': project.title,
        'date': simplejson.dumps(datetime.now().isoformat()),
        'entrepreneur': project.project_manager.name,
        'email': project.project_manager.email,
        'url': '{0}/project/{1}/'.format(settings.BASE_URL, project.slug),
    })


@shared_task
def add_work_examples(profile_id):
    examples = Attachment.objects.filter(
                content_type= ContentType.objects.get_for_model(Profile),
                object_id=profile_id
            )
    if not examples:
        profile = Profile.objects.get(id=profile_id)
        send_mail('add-work-examples', [profile], {})


@shared_task
def add_work_history(profile_id):
    history = Employee.objects.filter(profile=profile_id)
    if not history:
        profile = Profile.objects.get(id=profile_id)
        send_mail('add-work-history', [profile], {})


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
def connection_made_freelancer(entrepreneur_id, thread_id):
    entrepreneur = Profile.objects.get(id=entrepreneur_id)
    send_mail('connection-made-freelancer', [entrepreneur], {
        'fname': entrepreneur.first_name,
        'thread_id': thread_id,
    })

@shared_task
def project_approved_email(project_id):
    project = Project.objects.get(id=project_id)
    send_mail('project-approved', [project.project_manager], {
        'fname': project.project_manager.first_name,
        'url': '{0}/project/{1}/'.format(settings.BASE_URL, project.slug),
    })

def calculate_date_ranges(field, start, end):
    """
    Calculates date ranges to use in queryset

    :return: dict
    """
    range = {}
    range['{0}__gte'.format(field)] = start
    range['{0}__lt'.format(field)] = end
    return range

#TODO This is a database read heavy task, optimize
@celery_app.task
def loom_stats_email():
    yesterday = pendulum.yesterday()
    today = pendulum.today()
    week = yesterday.subtract(weeks=1)
    start_week = week.start_of('week')
    end_week = week.end_of('week').add(days=1)
    month = yesterday.subtract(months=1)
    days_in_month = month.days_in_month
    start_month = month.start_of('month')
    end_month = month.end_of('month').add(days=1)

    date_joined = calculate_date_ranges('date_joined', yesterday, today)
    date_created = calculate_date_ranges('date_created', yesterday, today)
    sent_at = calculate_date_ranges('sent_at', yesterday, today)
    create_date = calculate_date_ranges('create_date', yesterday, today)

    week_date_joined = calculate_date_ranges('date_joined', start_week, end_week)
    week_date_created = calculate_date_ranges('date_created', start_week, end_week)
    week_sent_at = calculate_date_ranges('sent_at', start_week, end_week)
    week_create_date = calculate_date_ranges('create_date', start_week, end_week)

    month_date_joined = calculate_date_ranges('date_joined', start_month, end_month)
    month_date_created = calculate_date_ranges('date_created', start_month, end_month)
    month_sent_at = calculate_date_ranges('sent_at', start_month, end_month)
    month_create_date = calculate_date_ranges('create_date', start_month, end_month)

    admins = Profile.objects.filter(is_superuser=True)
    developers = Profile.objects.exclude(roles=None)
    entrepreneurs = Profile.objects.filter(roles=None, biography__isnull=False)
    companies = Employee.objects.filter(primary=True)
    
    projects = Project.objects.filter(published=True, deleted=False)
    projects_mix = Project.objects.filter(mix=True, published=True, deleted=False)
    projects_cash = Project.objects.filter(
            (Q(estimated_equity_percentage__isnull=True) | Q(estimated_equity_percentage=0)),
            estimated_cash__isnull=False,
            published=True,
            deleted=False)
    projects_equity = Project.objects.filter(
            (Q(estimated_cash__isnull=True) | Q(estimated_cash=0)),
            estimated_equity_percentage__isnull=False,
            published=True,
            deleted=False)
    
    average_mix = projects_mix.aggregate(Avg('estimated_cash'), Avg('estimated_equity_percentage'))
    average_equity = projects_equity.aggregate(Avg('estimated_equity_percentage'))
    average_cash = projects_cash.aggregate(Avg('estimated_cash'))

    messages = Message.objects.all()
    requests = ProductOrder.objects.all()

    proposals = Proposal.objects.all()
    proposals_mix = Proposal.objects.filter(cash=True, equity=True)
    proposals_cash = Proposal.objects.filter(cash=True, equity=False)
    proposals_equity = Proposal.objects.filter(cash=False, equity=True)
    rate = Proposal.objects.filter(hourly_rate__isnull=False).aggregate(Avg('hourly_rate'))
    hours = proposals.aggregate(Avg('hours'))

    daily_developers = developers.filter(**date_joined).count()
    daily_entrepreneurs = entrepreneurs.filter(**date_joined).count()
    daily_company = companies.filter(profile__date_joined__gte=yesterday, profile__date_joined__lt=today).count()
    daily_projects = projects.filter(**date_created).count()
    daily_projects_cash = projects_cash.filter(**date_created).count()
    daily_projects_equity = projects_equity.filter(**date_created).count()
    daily_projects_mix = projects_mix.filter(**date_created).count()
    daily_messages = messages.filter(**sent_at).count()
    daily_requests = requests.filter(**date_created).count()
    daily_connections = connections.filter(**date_created).count()
    daily_proposals = proposals.filter(**create_date).count()
    daily_proposals_mix = proposals_mix.filter(**create_date).count()
    daily_proposals_cash = proposals_cash.filter(**create_date).count()
    daily_proposals_equity = proposals_equity.filter(**create_date).count()

    # Last week daily average
    week_developers = developers.filter(**week_date_joined).count() / 7
    week_entrepreneurs = entrepreneurs.filter(**week_date_joined).count() / 7
    week_company = companies.filter(profile__date_joined__gte=start_week, profile__date_joined__lt=end_week).count() / 7
    week_projects = projects.filter(**week_date_created).count() / 7
    week_projects_cash = projects_cash.filter(**week_date_created).count() / 7
    week_projects_equity = projects_equity.filter(**week_date_created).count() / 7
    week_projects_mix = projects_mix.filter(**week_date_created).count() / 7
    week_messages = messages.filter(**week_sent_at).count() / 7
    week_requests = requests.filter(**week_date_created).count() / 7
    week_connections = connections.filter(**week_date_created).count() / 7
    week_proposals = proposals.filter(**week_create_date).count() / 7
    week_proposals_mix = proposals_mix.filter(**week_create_date).count() / 7
    week_proposals_cash = proposals_cash.filter(**week_create_date).count() / 7
    week_proposals_equity = proposals_equity.filter(**week_create_date).count() / 7

    # Last month daily average
    month_developers = developers.filter(**month_date_joined).count() / days_in_month
    month_entrepreneurs = entrepreneurs.filter(**month_date_joined).count() / days_in_month
    month_company = companies.filter(profile__date_joined__gte=start_month, profile__date_joined__lt=end_month).count() / days_in_month
    month_projects = projects.filter(**month_date_created).count() / days_in_month
    month_projects_cash = projects_cash.filter(**month_date_created).count() / days_in_month
    month_projects_equity = projects_equity.filter(**month_date_created).count() / days_in_month
    month_projects_mix = projects_mix.filter(**month_date_created).count() / days_in_month
    month_messages = messages.filter(**month_sent_at).count() / days_in_month
    month_requests = requests.filter(**month_date_created).count() / days_in_month
    month_connections = connections.filter(**month_date_created).count() / days_in_month
    month_proposals = proposals.filter(**month_create_date).count() / days_in_month
    month_proposals_mix = proposals_mix.filter(**month_create_date).count() / days_in_month
    month_proposals_cash = proposals_cash.filter(**month_create_date).count() / days_in_month
    month_proposals_equity = proposals_equity.filter(**month_create_date).count() / days_in_month
    
    context = {
        'DAILY_DEVELOPERS': daily_developers,
        'DAILY_ENTREPRENEURS': daily_entrepreneurs,
        'DAILY_COMPANIES': daily_company,
        'DAILY_PROJECTS': daily_projects,
        'DAILY_CASHPROJECTS': daily_projects_cash,
        'DAILY_EQUITYPROJECTS': daily_projects_equity,
        'DAILY_MIXPROJECTS': daily_projects_mix,
        'DAILY_MESSAGES': daily_messages,
        'DAILY_REQUESTS': daily_requests,
        'DAILY_CONNECTIONS': daily_connections,
        'DAILY_PROPOSALS': daily_proposals,
        'DAILY_MIXPROPOSALS': daily_proposals_mix,
        'DAILY_CASHPROPOSALS': daily_proposals_cash,
        'DAILY_EQUITYPROPOSALS': daily_proposals_equity,
        'WOW_DEVELOPERS': round(week_developers, 2),
        'WOW_ENTREPRENEURS': round(week_entrepreneurs, 2),
        'WOW_COMPANIES':  round(week_company, 2),
        'WOW_PROJECTS': round(week_projects, 2),
        'WOW_CASHPROJECTS': round(week_projects_cash, 2),
        'WOW_EQUITYPROJECTS': round(week_projects_equity, 2),
        'WOW_MIXPROJECTS': round(week_projects_mix, 2),
        'WOW_MESSAGES':  round(week_messages, 2),
        'WOW_REQUESTS':  round(week_requests, 2),
        'WOW_CONNECTIONS': round(week_connections, 2),
        'WOW_PROPOSALS': round(week_proposals, 2),
        'WOW_CASHPROPOSALS': round(week_proposals_cash, 2),
        'WOW_EQUITYPROPOSALS': round(week_proposals_equity, 2),
        'WOW_MIXPROPOSALS': round(week_proposals_mix, 2),
        'MOM_DEVELOPERS': round(month_developers, 2),
        'MOM_ENTREPRENEURS': round(month_entrepreneurs, 2),
        'MOM_COMPANIES':  round(month_company, 2),
        'MOM_PROJECTS': round(month_projects, 2),
        'MOM_CASHPROJECTS': round(month_projects_cash, 2),
        'MOM_EQUITYPROJECTS': round(month_projects_equity, 2),
        'MOM_MIXPROJECTS': round(month_projects_mix, 2),
        'MOM_MESSAGES': round(month_messages, 2),
        'MOM_REQUESTS': round(month_requests, 2),
        'MOM_CONNECTIONS': round(month_connections, 2),
        'MOM_PROPOSALS':  round(month_proposals, 2),
        'MOM_MIXPROPOSALS':  round(month_proposals_mix, 2),
        'MOM_CASHPROPOSALS': round(month_proposals_cash, 2),
        'MOM_EQUITYPROPOSALS': round(month_proposals_equity, 2),
        'DEVELOPERS': developers.count(),
        'ENTREPRENEURS': entrepreneurs.count(),
        'COMPANIES': companies.count(),
        'PROJECTS': projects.count(),
        'CASHPROJECTS': projects_cash.count(),
        'EQUITYPROJECTS': projects_equity.count(),
        'MIXPROJECTS': projects_mix.count(),
        'EQUITY': '{0}%'.format(average_equity['estimated_equity_percentage__avg']),
        'CASH': '${0}'.format(average_cash['estimated_cash__avg']),
        'MIX': '${0}, {1}%'.format(average_mix['estimated_cash__avg'], average_mix['estimated_equity_percentage__avg']),
        'MESSAGES': messages.count(),
        'REQUESTS': requests.count(),
        'CONNECTIONS': connections.count(),
        'PROPOSALS': proposals.count(),
        'MIXPROPOSALS': proposals_mix.count(),
        'CASHPROPOSALS': proposals_cash.count(),
        'EQUITYPROPOSALS': proposals_equity.count(),
        'HOURLYRATE': '${0}/hour'.format(rate['hourly_rate__avg']),
        'HOURS': hours['hours__avg'],
    }
    send_mail('loom-stats', [admin for admin in admins], context)

