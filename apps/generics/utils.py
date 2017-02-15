import re
import mandrill
import logging
import pytz
from decimal import Decimal
from datetime import datetime, timedelta

from django.conf import settings
from django.core import signing
from rest_framework.exceptions import PermissionDenied
from rest_framework.authtoken.models import Token


def create_auth_token(user):
    token, created = Token.objects.get_or_create(user=user)

    utc_now = datetime.utcnow()
    utc_now = utc_now.replace(tzinfo=pytz.utc)

    if token.created < utc_now - timedelta(hours=48):
        token.delete()
        token = Token.objects.create(user=user)

    return token

def to_nice_string(num):
    return {
        1: 'one',
        2: 'two',
        3: 'three',
    }[num]

def to_browsable_fieldset(singular, count=2):
    return [singular + 's'] + [
        singular + '_' + to_nice_string(i) for i in range(1, count+1)
    ]

def has_keys(d, keys):
    for k in keys:
        if d.get(k, None) == None: return False
    return True

def collapse_listview(validated_data, singular, count=2, validator=lambda x : x is not None, required_fields=[]):
    items = validated_data.pop(singular + 's', None) or [
        item for item in [
            validated_data.pop(singular + '_' + to_nice_string(i), None)
            for i in range(1, count + 1)
        ] if validator(item) and has_keys(item, required_fields)
    ]
    validated_data[singular + 's'] = items
    return validated_data


def pop_subset(fields, data, fallback=[]):
    subset = {
        field: data.pop(field, fallback)
        for field in fields
    }
    return data, subset


def update_instance(instance, data):
    for k, v in data.items():
        if hasattr(instance, k) and v is not None:
            setattr(instance, k, v)
    instance.save()
    return instance


def field_names(model, exclude=tuple()):
    return tuple(field.name for field in model._meta.fields if field.name not in exclude)


def merge(*dicts):
    res = {}
    for d in dicts:
        res.update(d)
    return res


def normalize_key_suffixes(kwargs):
    return {
        re.sub('(_pk|_id)$', '', key): value
        for key, value in kwargs.items() }


def camel_to_underscored(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def normalized_subdict(d, keys):
    return { camel_to_underscored(k): d.get(k, None) for k in keys }


API_KEY = settings.MANDRILL_API_KEY
def send_to_emails(template_name, emails=[], context={}):
    " send template to the given emails, with the given context "
    logger = logging.getLogger()
    mandrill_client = mandrill.Mandrill(API_KEY)
    message = {
        'to': [{'email': email} for email in set(emails)],
        'global_merge_vars': [
            {'name': k, 'content': v}
            for k, v in context.iteritems()] }
    try:
        mandrill_client.messages.send_template(template_name, [], message)
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))

def send_mail(template_name, users, context):
    emails = [user.email for user in users if user.email_notifications]
    send_to_emails(template_name, emails=emails, context=context)

def sign_data(**kwargs):
    return signing.dumps(kwargs)

def parse_signature(signature):
    try:
        return signing.loads(signature)
    except signing.BadSignature:
        raise PermissionDenied(detail='signature invalid')


def percentage(base=None, percent=0, operation='of'):
    """
    utility for various percentage operations.
    operation options: { raw, of, removed, added }
    returns raw percentage if no base is provided
    all results are rounded to 2 decimal places
    """
    percent = Decimal(percent * 0.01)
    if (not base) or (operation == 'raw'):
        result = percent
    elif operation == 'of':
        result = (base * percent)
    elif operation == 'removed':
        result = base - (base * percent)
    elif operation == 'added':
        result = base + (base * percent)
    else:
        raise TypeError('operation must be one of { raw, of, removed, added }')
    return round(result, 2)
