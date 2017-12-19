import requests

from django.conf import settings

vlapi = {
    'event': 'https://app.viral-loops.com/api/v2/events',
}

def vl_register(user):
    payload = {
        "params": {
            "event": "registration",
            "user": {
                "firstname": user.first_name,
                "lastname": user.last_name,
                "email": user.email
            },
            "referrer": {
                "referralCode": user.referral_code
            },
        },
        "apiToken": settings.VL_API_KEY
    }
    headers = {'Content-Type': 'application/json'}
    return requests.post(vlapi['event'], json=payload)


def vl_conversion(user):
    #TODO Catch and resolve request errors properly
    payload = {
        'apiToken': settings.VL_API_KEY,
        'params': {
            'event': 'conversion',
            'user': {
                'firstname': user.first_name,
                'lastname': user.last_name,
                'email': user.email
            }
        },

    }
    return requests.post(vlapi['event'], json=payload)