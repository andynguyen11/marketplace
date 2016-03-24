import mandrill
import logging

from django.conf import settings

from apps.providers.models import Job, Price


mandrill_client = mandrill.Mandrill(settings.MANDRILL_KEY)
logger = logging.getLogger(__name__)


def account_confirmation(customer):
    job = Job.objects.filter(customer=customer).latest('date_created')
    address2 = customer.service_address2 if customer.service_address2 else ''
    template_content = [
        {'name': 'address', 'content': '{0} {1}'.format(customer.service_address, address2)},
        {'name': 'citystatezip', 'content': '{0}, {1} {2}'.format(customer.service_city, customer.service_state, customer.service_zipcode)},
        {'name': 'name', 'content': customer.user.first_name},
        {'name': 'price', 'content': '${0}'.format(job.charge)}
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name='new-registration',
            template_content=template_content,
            message={
                'to': [{'email': customer.user.email, }],
                "global_merge_vars": [
                    {'name': 'address', 'content': '{0} {1}'.format(customer.service_address, address2)},
                    {'name': 'citystatezip', 'content': '{0}, {1} {2}'.format(customer.service_city, customer.service_state, customer.service_zipcode)},
                    {'name': 'name', 'content': job.customer.user.first_name},
                    {'name': 'price', 'content': '${0}'.format(job.charge)}
                ],
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result


def job_rebook(job):
    address2 = job.customer.service_address2 if job.customer.service_address2 else ''
    template_content = [
        {'name': 'address', 'content': '{0} {1}'.format(job.customer.service_address, address2)},
        {'name': 'citystatezip', 'content': '{0}, {1} {2}'.format(job.customer.service_city, job.customer.service_state, job.customer.service_zipcode)},
        {'name': 'name', 'content': job.customer.user.first_name},
        {'name': 'price', 'content': '${0}'.format(job.charge)}
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name='job-rebook',
            template_content=template_content,
            message={
                'to': [{'email': job.customer.user.email, }],
                "global_merge_vars": [
                    {'name': 'address', 'content': '{0} {1}'.format(job.customer.service_address, address2)},
                    {'name': 'citystatezip', 'content': '{0}, {1} {2}'.format(job.customer.service_city, job.customer.service_state, job.customer.service_zipcode)},
                    {'name': 'name', 'content': job.customer.user.first_name},
                    {'name': 'price', 'content': '${0}'.format(job.charge)}
                ],
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result


def service_complete(job):
    template_content = [
        {'name': 'name', 'content': job.customer.user.first_name},
        {'name': 'provider', 'content': job.provider.name}
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name='service-complete',
            template_content=template_content,
            message={
                'to': [{'email': job.customer.user.email, }],
                "global_merge_vars": [
                    {'name': 'name', 'content': job.customer.user.first_name},
                    {'name': 'provider', 'content': job.provider.name}
                ],
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result


def new_job(job):
    template_content = [
        {'name': 'address', 'content': '{0}'.format(job.customer.service_address, )},
        {'name': 'citystatezip', 'content': '{0}, {1} {2}'.format(job.customer.service_city, job.customer.service_state, job.customer.service_zipcode)},
        {'name': 'name', 'content': '{0} {1}'.format(job.customer.user.first_name, job.customer.user.last_name)},
        {'name': 'price', 'content': '${0}'.format(job.charge)}
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name='new-job',
            template_content=template_content,
            message={
                'to': [{'email': 'info@lawncall.com', }],
                "global_merge_vars": [
                    {'name': 'address', 'content': '{0}'.format(job.customer.service_address, )},
                    {'name': 'citystatezip', 'content': '{0}, {1} {2}'.format(job.customer.service_city, job.customer.service_state, job.customer.service_zipcode)},
                    {'name': 'name', 'content': '{0} {1}'.format(job.customer.user.first_name, job.customer.user.last_name)},
                    {'name': 'price', 'content': '${0}'.format(job.charge)}
                ],
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result