import mandrill
import logging

from django.conf import settings


mandrill_client = mandrill.Mandrill(settings.MANDRILL_API_KEY)

def account_confirmation(user, name, role=None):
    template = 'welcome-developer' if role else 'welcome-entrepreneur'
    template_content = [
        {'name': 'fname', 'content': name},
        {'name': 'email', 'content': user.email},
    ]
    try:
        result = mandrill_client.messages.send_template(
            template_name=template,
            template_content=template_content,
            message={
                'to': [{'email': user.email, }],
                "global_merge_vars": [
                    {'name': 'fname', 'content': name},
                    {'name': 'email', 'content': user.email},
                ],
            }
        )
    except mandrill.Error, e:
        logger.error('Mandrill Error | %s - %s' % (e.__class__, e))
    return result