import re
import mandrill
import logging

from django.conf import settings

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

def send_mail(template_name, users, context):
    mandrill_client = mandrill.Mandrill(API_KEY)
    message = {
        'to': [],
        'global_merge_vars': []
    }
    for user in users:
        if user.email_notifications:
            message['to'].append({'email': user.email})

    for k, v in context.iteritems():
        message['global_merge_vars'].append(
            {'name': k, 'content': v}
        )
    try:
        mandrill_client.messages.send_template(template_name, [], message)
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))

