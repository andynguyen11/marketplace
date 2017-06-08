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
from business.models import Job, Document, Project, Employee
from expertratings.models import SkillTestResult
from generics.models import Attachment
from generics.utils import send_mail, send_to_emails, sign_data, parse_signature, create_auth_token
from payment.models import ProductOrder
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
def account_confirmation(user_id, roles=None):
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
    last_emailed = thread.last_emailed_bidder if recipient_id == thread.job.contractor.id else thread.last_emailed_owner
    last_emailed = last_emailed if last_emailed else utc.localize(datetime.now() - timedelta(hours=7))
    if unread_messages.count() >= 1 and last_emailed < utc.localize(email_threshold):
        send_mail('message-received', [recipient], {
            'projectname': thread.job.project.title,
            'email': recipient.email
        })
        if recipient_id == thread.job.contractor.id:
            thread.last_emailed_bidder = datetime.now()
        else:
            thread.last_emailed_owner = datetime.now()
        thread.save()

@shared_task
def dev_contact_card_email(job_id):
    job = Job.objects.get(id=job_id)
    document = Document.objects.get(job=job, type='MSA')
    dev_context = {
        'fname': job.project.project_manager.first_name,
        'lname': job.project.project_manager.last_name,
        'email': job.project.project_manager.email,
        'document': document.docusign_document.id,
        'project': job.project.title,
    }
    dev_context['phone'] = job.project.project_manager.phone if job.project.project_manager.phone else ''
    dev_context['title'] = job.project.project_manager.title if job.project.project_manager.title else ''
    dev_context['company'] = job.project.company.name if job.project.company else ''
    send_mail('new-contract', [job.contractor], dev_context)

@shared_task
def nda_sent_email(job_id):
    job = Job.objects.get(id=job_id)
    thread = Message.objects.get(job=job)
    merge_vars = {
        'fname': job.project.project_manager.first_name,
        'project': job.project.title,
        'email': job.contractor.email,
        'thread': thread.id,
    }
    send_mail('nda-sent', [job.contractor], merge_vars)

@shared_task
def nda_signed_entrepreneur_email(job_id):
    job = Job.objects.get(id=job_id)
    merge_vars = {
        'fname': job.contractor.first_name,
        'project': job.project.title,
        'email': job.project.project_manager.email,
    }
    send_mail('nda-signed-entrepreneur', [job.project.project_manager], merge_vars)

@shared_task
def nda_signed_freelancer_email(job_id):
    job = Job.objects.get(id=job_id)
    merge_vars = {
        'fname': job.project.project_manager.first_name,
        'project': job.project.title,
        'email': job.contractor.email,
    }
    send_mail('nda-signed-freelancer', [job.contractor], merge_vars)

@shared_task
def terms_sent_email(job_id):
    job = Job.objects.get(id=job_id)
    thread = Message.objects.get(job=job)
    send_mail('bid-accepted', [job.contractor], {
        'entrepreneur': job.project.project_manager.first_name,
        'developername': job.contractor.first_name,
        'projectname': job.project.title,
        'developertype': job.contractor.role.capitalize(),
        'cash': job.cash if job.cash else 0,
        'equity': simplejson.dumps(job.equity) if job.equity else 0,
        'hours': job.hours,
        'email': job.contractor.email,
        'thread': thread.id,
    })

@shared_task
def terms_approved_email(job_id):
    job = Job.objects.get(id=job_id)
    thread = Message.objects.get(job=job)
    merge_vars = {
        'fname': job.contractor.first_name,
        'project': job.project.title,
        'email': job.project.project_manager.email,
        'thread': thread.id,
    }
    send_mail('terms-approved', [job.project.project_manager], merge_vars)


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
    end_month = month.start_of('month').add(days=1)

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
    connections = ProductOrder.objects.filter(status='paid')

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
        'DAILY_EQUITY': daily_messages,
        'DAILY_CASH': daily_requests,
        'DAILY_MIX': daily_connections,
        'DAILY_MESSAGES': daily_proposals,
        'DAILY_REQUESTS': daily_proposals_mix,
        'DAILY_CONNECTIONS': daily_proposals_cash,
        'DAILY_PROPOSALS': daily_proposals_equity,
        'WOW_DEVELOPERS': week_developers,
        'WOW_ENTREPRENEURS': week_entrepreneurs,
        'WOW_COMPANIES':  week_company,
        'WOW_PROJECTS': week_projects,
        'WOW_CASHPROJECTS': week_projects_cash,
        'WOW_EQUITYPROJECTS': week_projects_equity,
        'WOW_MIXPROJECTS': week_projects_mix,
        'WOW_EQUITY': week_messages,
        'WOW_CASH': week_requests,
        'WOW_MIX': week_connections,
        'WOW_MESSAGES':  week_proposals,
        'WOW_REQUESTS':  week_proposals_mix,
        'WOW_CONNECTIONS': week_proposals_cash,
        'WOW_PROPOSALS': week_proposals_equity,
        'MOM_DEVELOPERS': month_developers,
        'MOM_ENTREPRENEURS': month_entrepreneurs,
        'MOM_COMPANIES':  month_company,
        'MOM_PROJECTS': month_projects,
        'MOM_CASHPROJECTS': month_projects_cash,
        'MOM_EQUITYPROJECTS': month_projects_equity,
        'MOM_MIXPROJECTS': month_projects_mix,
        'MOM_EQUITY': month_messages,
        'MOM_CASH': month_requests,
        'MOM_MIX': month_connections,
        'MOM_MESSAGES':  month_proposals,
        'MOM_REQUESTS':  month_proposals_mix,
        'MOM_CONNECTIONS': month_proposals_cash,
        'MOM_PROPOSALS': month_proposals_equity,
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
    
