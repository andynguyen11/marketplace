import mandrill
import logging
import urllib
import datetime

from django.conf import settings
from django.core.urlresolvers import reverse

from accounts.helpers import create_auth_token
from apps.transactions.helpers import calculate_total, calculate_net, calculate_tax


mandrill_client = mandrill.Mandrill(settings.MANDRILL_KEY)
logger = logging.getLogger(__name__)


def delegate_job(job, provider):
    token = create_auth_token(provider.primary_contact.user)
    template_content = [
        {'name': 'name', 'content': provider.primary_contact.user.first_name},
        {'name': 'address', 'content': '{0} {1}'.format(job.customer.service_address, job.customer.service_address2)},
        {'name': 'address_link', 'content': 'https://www.google.com/maps/place/{0}'.format('{0} {1}, {2}, {3} {4}'.format(job.customer.service_address, job.customer.service_address2, job.customer.service_city, job.customer.service_state, job.customer.service_zipcode))},
        {'name': 'service', 'content': job.service.description},
        {'name': 'total_payment', 'content': '${0}'.format(calculate_total(job, provider))},
        {'name': 'net_income', 'content': '${0}'.format(calculate_net(job, provider))},
        {'name': 'sales_tax', 'content': '${0}'.format(calculate_tax(job, provider))},
        {'name': 'notes', 'content': '{0}'.format(job.notes if job.notes else 'None')},
        {'name': 'accept_link', 'content': '{0}{1}?token={2}'.format(settings.BASE_URL, reverse('confirm-job', kwargs={'status': 'accept', 'job_id': job.id}), token)},
        {'name': 'decline_link', 'content': '{0}{1}?token={2}'.format(settings.BASE_URL, reverse('confirm-job', kwargs={'status': 'decline', 'job_id': job.id}), token)},
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name='delegate-job',
            template_content=template_content,
            message={
                "subject": "New Booking Available ({0}-{1}): {2} {3}".format(datetime.datetime.now().strftime("%y%m%d"), job.id, job.customer.service_address, job.customer.service_address2),
                'to': [{'email': provider.primary_contact.user.email, }],
                "global_merge_vars": template_content,
                "bcc_address": "service@lawncall.com",
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result


def accepted_job(job_id, provider_name):
    template_content = [
        {'name': 'provider', 'content': provider_name},
        {'name': 'job', 'content': job_id},
        {'name': 'job_link', 'content': '{0}/admin/providers/job/{1}'.format(settings.BASE_URL, job_id)},
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name='internal-accept-job',
            template_content=template_content,
            message={
                'to': [{'email': 'service@lawncall.com', }],
                "global_merge_vars": template_content,
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result


def declined_job(job_id, provider_name):
    template_content = [
        {'name': 'provider', 'content': provider_name},
        {'name': 'job', 'content': job_id},
        {'name': 'job_link', 'content': '{0}/admin/providers/job/{1}'.format(settings.BASE_URL, job_id)},
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name='internal-decline-job',
            template_content=template_content,
            message={
                'to': [{'email': 'service@lawncall.com', }],
                "global_merge_vars": template_content,
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result


def completed_job(job_id, provider_name):
    template_content = [
        {'name': 'provider', 'content': provider_name},
        {'name': 'job', 'content': job_id},
        {'name': 'job_link', 'content': '{0}/admin/providers/job/{1}'.format(settings.BASE_URL, job_id)},
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name='internal-completed-job',
            template_content=template_content,
            message={
                'to': [{'email': 'service@lawncall.com', }],
                "global_merge_vars": template_content,
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result