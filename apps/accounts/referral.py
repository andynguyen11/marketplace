import requests

from django.conf import settings

vlapi = {
    'event': 'https://app.viral-loops.com/api/v2/events',
}

def conversion(user):
    #TODO Catch and resolve request errors properly
    payload = {
        'apiToken': settings.VL_API_KEY,
        'params': {
            'event': 'conversion',
            'user': {
                'firstname': user.first_name,
                'lastname': user.last_name,
                'email': user.email
            },
            'referrer': {
                'referralCode': user.referral_code
            },
        },

    }
    return requests.post(vlapi['event'], data=payload)