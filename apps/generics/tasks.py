from __future__ import absolute_import, division
from datetime import datetime, timedelta
import pendulum
import pytz
import simplejson

import stripe
from celery import shared_task
from celery.schedules import crontab
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.db.models import Avg, Q, Sum
from django.utils.http import urlencode
from rest_framework.exceptions import ValidationError, PermissionDenied

from market.celery import app as celery_app
from accounts.models import Profile
from business.models import Project, Employee, NDA
from generics.models import Attachment
from generics.utils import send_mail, send_to_emails, sign_data, parse_signature, create_auth_token, calculate_date_ranges
from payment.helpers import get_source
from payment.models import Invoice
from proposals.models import Proposal
from postman.models import Message

stripe.api_key = settings.STRIPE_KEY
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
    if unread_messages.count() >= 1:
        send_mail('message-received', [recipient], {
            'fname': recipient.first_name,
            'email': recipient.email
        })


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
def queue_mail(template, user_id, context, language='mailchimp'):
    user = Profile.objects.get(id=user_id)
    send_mail(template, [user], context=context, language=language)

#TODO This is a database read heavy task, optimize
@celery_app.task
def loom_stats_email():
    #Date utilities
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
    date_sent = calculate_date_ranges('sent_date', yesterday, today)
    date_paid = calculate_date_ranges('date_paid', yesterday, today)

    week_date_joined = calculate_date_ranges('date_joined', start_week, end_week)
    week_date_created = calculate_date_ranges('date_created', start_week, end_week)
    week_sent_at = calculate_date_ranges('sent_at', start_week, end_week)
    week_create_date = calculate_date_ranges('create_date', start_week, end_week)
    week_date_sent = calculate_date_ranges('sent_date', start_week, end_week)
    week_date_paid = calculate_date_ranges('date_paid', start_week, end_week)

    month_date_joined = calculate_date_ranges('date_joined', start_month, end_month)
    month_date_created = calculate_date_ranges('date_created', start_month, end_month)
    month_sent_at = calculate_date_ranges('sent_at', start_month, end_month)
    month_create_date = calculate_date_ranges('create_date', start_month, end_month)
    month_date_sent = calculate_date_ranges('sent_date', start_month, end_month)
    month_date_paid = calculate_date_ranges('date_paid', start_month, end_month)

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

    proposals = Proposal.objects.all()
    proposals_mix = Proposal.objects.filter(cash=True, equity=True)
    proposals_cash = Proposal.objects.filter(cash=True, equity=False)
    proposals_equity = Proposal.objects.filter(cash=False, equity=True)
    rate = Proposal.objects.filter(hourly_rate__isnull=False).aggregate(Avg('hourly_rate'))
    hours = proposals.aggregate(Avg('hours'))

    invoices = Invoice.objects.exclude(status='draft')
    paid_invoices = Invoice.objects.filter(status='paid')
    daily_paid_invoices = paid_invoices.filter(**date_paid)
    week_paid_invoices = paid_invoices.filter(**week_date_paid)
    month_paid_invoices = paid_invoices.filter(**month_date_paid)
    invoices_cash = invoices.aggregate(Sum('invoice_items__amount'))['invoice_items__amount__sum']
    invoices_hours = invoices.aggregate(Sum('invoice_items__hours'))['invoice_items__hours__sum']
    invoices_fees = sum([invoice.application_fee() for invoice in paid_invoices])

    daily_developers = developers.filter(**date_joined).count()
    daily_entrepreneurs = entrepreneurs.filter(**date_joined).count()
    daily_company = companies.filter(profile__date_joined__gte=yesterday, profile__date_joined__lt=today).count()
    daily_projects = projects.filter(**date_created).count()
    daily_projects_cash = projects_cash.filter(**date_created).count()
    daily_projects_equity = projects_equity.filter(**date_created).count()
    daily_projects_mix = projects_mix.filter(**date_created).count()
    daily_messages = messages.filter(**sent_at).count()
    daily_proposals = proposals.filter(**create_date).count()
    daily_proposals_mix = proposals_mix.filter(**create_date).count()
    daily_proposals_cash = proposals_cash.filter(**create_date).count()
    daily_proposals_equity = proposals_equity.filter(**create_date).count()
    daily_invoices = invoices.filter(**date_sent).count()
    daily_invoices_cash = invoices.filter(**date_sent).aggregate(Sum('invoice_items__amount'))['invoice_items__amount__sum']
    daily_invoices_hours = invoices.filter(**date_sent).aggregate(Sum('invoice_items__hours'))['invoice_items__hours__sum']
    daily_invoices_fees = sum([invoice.application_fee() for invoice in daily_paid_invoices])

    # Last week daily average
    week_developers = developers.filter(**week_date_joined).count() / 7
    week_entrepreneurs = entrepreneurs.filter(**week_date_joined).count() / 7
    week_company = companies.filter(profile__date_joined__gte=start_week, profile__date_joined__lt=end_week).count() / 7
    week_projects = projects.filter(**week_date_created).count() / 7
    week_projects_cash = projects_cash.filter(**week_date_created).count() / 7
    week_projects_equity = projects_equity.filter(**week_date_created).count() / 7
    week_projects_mix = projects_mix.filter(**week_date_created).count() / 7
    week_messages = messages.filter(**week_sent_at).count() / 7
    week_proposals = proposals.filter(**week_create_date).count() / 7
    week_proposals_mix = proposals_mix.filter(**week_create_date).count() / 7
    week_proposals_cash = proposals_cash.filter(**week_create_date).count() / 7
    week_proposals_equity = proposals_equity.filter(**week_create_date).count() / 7
    week_invoices = invoices.filter(**week_date_sent).count() / 7
    week_invoices_cash = invoices.filter(**week_date_sent).aggregate(Sum('invoice_items__amount'))
    week_invoices_cash = week_invoices_cash['invoice_items__amount__sum'] / 7 if week_invoices_cash['invoice_items__amount__sum'] else 0
    week_invoices_hours = invoices.filter(**week_date_sent).aggregate(Sum('invoice_items__hours'))
    week_invoices_hours = week_invoices_hours['invoice_items__hours__sum'] / 7 if week_invoices_hours['invoice_items__hours__sum'] else 0
    week_invoices_fees = sum([invoice.application_fee() for invoice in week_paid_invoices]) / 7

    # Last month daily average
    month_developers = developers.filter(**month_date_joined).count() / days_in_month
    month_entrepreneurs = entrepreneurs.filter(**month_date_joined).count() / days_in_month
    month_company = companies.filter(profile__date_joined__gte=start_month, profile__date_joined__lt=end_month).count() / days_in_month
    month_projects = projects.filter(**month_date_created).count() / days_in_month
    month_projects_cash = projects_cash.filter(**month_date_created).count() / days_in_month
    month_projects_equity = projects_equity.filter(**month_date_created).count() / days_in_month
    month_projects_mix = projects_mix.filter(**month_date_created).count() / days_in_month
    month_messages = messages.filter(**month_sent_at).count() / days_in_month
    month_proposals = proposals.filter(**month_create_date).count() / days_in_month
    month_proposals_mix = proposals_mix.filter(**month_create_date).count() / days_in_month
    month_proposals_cash = proposals_cash.filter(**month_create_date).count() / days_in_month
    month_proposals_equity = proposals_equity.filter(**month_create_date).count() / days_in_month
    month_invoices = invoices.filter(**month_date_sent).count() / days_in_month
    month_invoices_cash = invoices.filter(**month_date_sent).aggregate(Sum('invoice_items__amount'))
    month_invoices_cash =  month_invoices_cash['invoice_items__amount__sum'] / days_in_month if month_invoices_cash['invoice_items__amount__sum'] else 0
    month_invoices_hours = invoices.filter(**month_date_sent).aggregate(Sum('invoice_items__hours'))
    month_invoices_hours = month_invoices_hours['invoice_items__hours__sum'] / days_in_month if month_invoices_hours['invoice_items__hours__sum'] else 0
    month_invoices_fees = sum([invoice.application_fee() for invoice in month_paid_invoices]) / days_in_month
    
    context = {
        'DAILY_DEVELOPERS': daily_developers,
        'DAILY_ENTREPRENEURS': daily_entrepreneurs,
        'DAILY_COMPANIES': daily_company,
        'DAILY_PROJECTS': daily_projects,
        'DAILY_CASHPROJECTS': daily_projects_cash,
        'DAILY_EQUITYPROJECTS': daily_projects_equity,
        'DAILY_MIXPROJECTS': daily_projects_mix,
        'DAILY_MESSAGES': daily_messages,
        'DAILY_PROPOSALS': daily_proposals,
        'DAILY_MIXPROPOSALS': daily_proposals_mix,
        'DAILY_CASHPROPOSALS': daily_proposals_cash,
        'DAILY_EQUITYPROPOSALS': daily_proposals_equity,
        'DAILY_INVOICES': daily_invoices,
        'DAILY_INVOICES_CASH': daily_invoices_cash,
        'DAILY_INVOICES_HOURS': daily_invoices_hours,
        'DAILY_INVOICES_FEES': daily_invoices_fees,
        'WOW_DEVELOPERS': round(week_developers, 2),
        'WOW_ENTREPRENEURS': round(week_entrepreneurs, 2),
        'WOW_COMPANIES':  round(week_company, 2),
        'WOW_PROJECTS': round(week_projects, 2),
        'WOW_CASHPROJECTS': round(week_projects_cash, 2),
        'WOW_EQUITYPROJECTS': round(week_projects_equity, 2),
        'WOW_MIXPROJECTS': round(week_projects_mix, 2),
        'WOW_MESSAGES':  round(week_messages, 2),
        'WOW_PROPOSALS': round(week_proposals, 2),
        'WOW_CASHPROPOSALS': round(week_proposals_cash, 2),
        'WOW_EQUITYPROPOSALS': round(week_proposals_equity, 2),
        'WOW_MIXPROPOSALS': round(week_proposals_mix, 2),
        'WOW_INVOICES': week_invoices,
        'WOW_INVOICES_CASH': week_invoices_cash,
        'WOW_INVOICES_HOURS': week_invoices_hours,
        'WOW_INVOICES_FEES': week_invoices_fees,
        'MOM_DEVELOPERS': round(month_developers, 2),
        'MOM_ENTREPRENEURS': round(month_entrepreneurs, 2),
        'MOM_COMPANIES':  round(month_company, 2),
        'MOM_PROJECTS': round(month_projects, 2),
        'MOM_CASHPROJECTS': round(month_projects_cash, 2),
        'MOM_EQUITYPROJECTS': round(month_projects_equity, 2),
        'MOM_MIXPROJECTS': round(month_projects_mix, 2),
        'MOM_MESSAGES': round(month_messages, 2),
        'MOM_PROPOSALS':  round(month_proposals, 2),
        'MOM_MIXPROPOSALS':  round(month_proposals_mix, 2),
        'MOM_CASHPROPOSALS': round(month_proposals_cash, 2),
        'MOM_EQUITYPROPOSALS': round(month_proposals_equity, 2),
        'MOM_INVOICES': month_invoices,
        'MOM_INVOICES_CASH': month_invoices_cash,
        'MOM_INVOICES_HOURS': month_invoices_hours,
        'MOM_INVOICES_FEES': month_invoices_fees,
        'DEVELOPERS': developers.count(),
        'ENTREPRENEURS': entrepreneurs.count(),
        'COMPANIES': companies.count(),
        'PROJECTS': projects.count(),
        'CASHPROJECTS': projects_cash.count(),
        'EQUITYPROJECTS': projects_equity.count(),
        'MIXPROJECTS': projects_mix.count(),
        'EQUITY': '{0}%'.format(round(average_equity['estimated_equity_percentage__avg'], 2)),
        'CASH': '${0}'.format(round(average_cash['estimated_cash__avg'], 2)),
        'MIX': '${0}, {1}%'.format(round(average_mix['estimated_cash__avg'], 2), round(average_mix['estimated_equity_percentage__avg'], 2)),
        'MESSAGES': messages.count(),
        'PROPOSALS': proposals.count(),
        'MIXPROPOSALS': proposals_mix.count(),
        'CASHPROPOSALS': proposals_cash.count(),
        'EQUITYPROPOSALS': proposals_equity.count(),
        'HOURLYRATE': '${0}/hour'.format(round(rate['hourly_rate__avg'], 2)),
        'HOURS': hours['hours__avg'],
        'INVOICES': invoices.count(),
        'INVOICES_CASH': '${0}'.format(invoices_cash) if invoices_cash else 0,
        'INVOICES_HOURS': invoices_hours,
        'INVOICES_FEES': invoices_fees
    }
    send_mail('loom-stats', [admin for admin in admins], context)

